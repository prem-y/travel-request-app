sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.travel.request.travelrequest.controller.Employee", {

        // ── LIFECYCLE ──────────────────────────────────────────────────────────

        onInit: function () {
            this._initModels();
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("employee").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._loadRequests();
        },

        // ── MODELS ─────────────────────────────────────────────────────────────

        _initModels: function () {

            // Request list model
            var oRequestListModel = new JSONModel({ requests: [] });
            this.getView().setModel(oRequestListModel, "requestListModel");

            // UI state model
            var oUiModel = new JSONModel({
                busy: false,
                tableTitle: "My Requests (0)"
            });
            this.getView().setModel(oUiModel, "uiModel");
        },

        // ── ODATA LOAD (Mock) ──────────────────────────────────────────────────

        _loadRequests: function () {
            var oUiModel = this.getView().getModel("uiModel");
            var oSharedModel = this.getOwnerComponent().getModel("sharedModel");

            oUiModel.setProperty("/busy", true);

            setTimeout(function () {
                var aRequests = oSharedModel.getProperty("/requests") || [];
                // Show only this employee's requests
                var aMyRequests = aRequests.filter(function (r) {
                    return r.employeeId === "EMP-00123";
                });

                this.getView().getModel("requestListModel").setProperty("/requests", aMyRequests);
                oUiModel.setProperty("/busy", false);
                this._updateTableTitle(aMyRequests.length);

            }.bind(this), 400);
        },

        // ── FILTERS ────────────────────────────────────────────────────────────

        onFilterChange: function () {
            this._applyFilters();
        },

        onSearch: function () {
            this._applyFilters();
        },

        onClearFilters: function () {
            this.byId("filterStatus").setSelectedKey("");
            this.byId("filterTravelType").setSelectedKey("");
            this.byId("searchField").setValue("");
            this._applyFilters();
        },

        _applyFilters: function () {
            var oTable = this.byId("requestTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            var sStatus = this.byId("filterStatus").getSelectedKey();
            var sTravelType = this.byId("filterTravelType").getSelectedKey();
            var sSearch = this.byId("searchField").getValue();

            if (sStatus) {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }
            if (sTravelType) {
                aFilters.push(new Filter("travelType", FilterOperator.EQ, sTravelType));
            }
            if (sSearch) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("destination", FilterOperator.Contains, sSearch),
                        new Filter("purpose", FilterOperator.Contains, sSearch),
                        new Filter("requestId", FilterOperator.Contains, sSearch)
                    ],
                    and: false
                }));
            }

            oBinding.filter(aFilters);
            this._updateTableTitle(oBinding.getLength());
        },

        // ── ACTIONS ────────────────────────────────────────────────────────────

        onNewRequest: function () {
            this.getOwnerComponent().getRouter().navTo("requestCreate");
        },

        onRefresh: function () {
            this._loadRequests();
            MessageToast.show("Refreshed.");
        },

        onRowPress: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("requestListModel").getObject();
            MessageToast.show("Opening " + oItem.requestId);
            // navTo requestDetail when ready
        },

        onViewRequest: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("requestListModel").getObject();
            MessageToast.show("Viewing " + oItem.requestId);
        },

        onEditRequest: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("requestListModel").getObject();
            this.getOwnerComponent().getRouter().navTo("requestCreate", {
                id: oItem.requestId
            });
        },

        onDeleteRequest: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("requestListModel").getObject();
            var oModel = this.getView().getModel("requestListModel");
            var aItems = oModel.getProperty("/requests");

            MessageBox.confirm("Delete request " + oItem.requestId + "?", {
                title: "Confirm Delete",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {

                        // ── Real OData delete: ───────────────────────────────
                        // oODataModel.remove("/TravelRequests('" + oItem.requestId + "')", {
                        //     success: function() { this._loadRequests(); }.bind(this),
                        //     error:   function(oError) { this._handleError(oError); }.bind(this)
                        // });
                        // ────────────────────────────────────────────────────

                        // Mock delete
                        var aFiltered = aItems.filter(function (r) {
                            return r.requestId !== oItem.requestId;
                        });
                        oModel.setProperty("/requests", aFiltered);
                        this._updateTableTitle(aFiltered.length);
                        MessageToast.show("Request " + oItem.requestId + " deleted.");
                    }
                }.bind(this)
            });
        },

        onViewToggle: function (oEvent) {
            // Placeholder for switching between table/list view
            var sKey = oEvent.getParameter("item").getKey();
            MessageToast.show("View: " + sKey);
        },

        // ── ERROR HANDLING ─────────────────────────────────────────────────────

        _handleError: function (oError) {
            var sMessage = "Failed to load requests.";
            if (oError && oError.message) sMessage = oError.message;
            MessageBox.error(sMessage, {
                title: "Error",
                details: oError ? JSON.stringify(oError, null, 2) : ""
            });
        },

        // ── HELPERS ────────────────────────────────────────────────────────────

        _updateTableTitle: function (iCount) {
            this.getView().getModel("uiModel")
                .setProperty("/tableTitle", "My Requests (" + iCount + ")");
        }

    });
});