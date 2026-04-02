sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/travel/request/travelrequest/model/formatter",
    "com/travel/request/travelrequest/model/Utils"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast, formatter, Utils) {
    "use strict";

    return Controller.extend("com.travel.request.travelrequest.controller.Employee", {
        formatter: formatter,

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
            var oODataModel = this.getOwnerComponent().getModel();
            var sEmpId = this.getOwnerComponent().getModel("session").getProperty("/employeeId");

            Utils.setBusy(this.getView(), true);

            oODataModel.read("/TravelRequests", {
                filters: [
                    new Filter("EmployeeId", FilterOperator.EQ, sEmpId)
                ],
                success: function (oData) {
                    // Map OData PascalCase to camelCase for view bindings
                    var aMapped = oData.results.map(function (r) {
                        return {
                            requestId: r.RequestId,
                            employeeId: r.EmployeeId,
                            destination: r.Destination,
                            travelType: r.TravelType,
                            startDate: r.StartDate,
                            endDate: r.EndDate,
                            estimatedAmount: r.EstimatedAmount,
                            purpose: r.Purpose,
                            status: r.Status
                        };
                    });
                    this.getView().getModel("requestListModel").setProperty("/requests", aMapped);
                    Utils.setBusy(this.getView(), false);
                    this._updateTableTitle(aMapped.length);
                }.bind(this),
                error: function (oError) {
                    Utils.handleError(oError, this.getView());
                }.bind(this)
            });
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
            Utils.handleError(oError, this.getView());
        },

        // ── HELPERS ────────────────────────────────────────────────────────────

        _updateTableTitle: function (iCount) {
            Utils.updateTableTitle(this.getView(), "uiModel", "/tableTitle", "My Requests", iCount);
        },

    });
});