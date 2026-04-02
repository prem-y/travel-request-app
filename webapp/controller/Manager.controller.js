sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/TextArea",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Text",
    "com/travel/request/travelrequest/model/formatter",
    "com/travel/request/travelrequest/model/Utils"
], function (Controller, JSONModel, Filter, FilterOperator,
    MessageBox, MessageToast, Dialog, Button, TextArea, VBox, Label, Text, formatter, Utils) {
    "use strict";

    return Controller.extend("com.travel.request.travelrequest.controller.Manager", {
        formatter: formatter,
        // ── LIFECYCLE ──────────────────────────────────────────────────────────

        onInit: function () {
            this._initModels();
            this.getOwnerComponent().getRouter()
                .getRoute("manager")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._loadPendingRequests();
        },

        // ── MODELS ─────────────────────────────────────────────────────────────

        _initModels: function () {
            this.getView().setModel(new JSONModel({ requests: [] }), "managerModel");
            this.getView().setModel(new JSONModel({
                busy: false,
                tableTitle: "Pending Requests (0)",
                selectionText: "",
                bulkEnabled: false
            }), "uiModel");
        },

        // ── LOAD ───────────────────────────────────────────────────────────────

        _loadPendingRequests: function () {
            var oUiModel = this.getView().getModel("uiModel");
            var oSharedModel = this.getOwnerComponent().getModel("sharedModel");

            oUiModel.setProperty("/busy", true);

            setTimeout(function () {
                var aAll = oSharedModel.getProperty("/requests") || [];
                var aPending = aAll.filter(function (r) {
                    return r.status === "Pending";
                });

                this.getView().getModel("managerModel").setProperty("/requests", aPending);
                oUiModel.setProperty("/busy", false);
                this._updateTitle(aPending.length);

            }.bind(this), 600);
        },

        // ── FILTERS ────────────────────────────────────────────────────────────

        onFilterChange: function () { this._applyFilters(); },
        onSearch: function () { this._applyFilters(); },

        onClearFilters: function () {
            this.byId("mFilterType").setSelectedKey("");
            this.byId("mSearchField").setValue("");
            this._applyFilters();
        },

        _applyFilters: function () {
            var oBinding = this.byId("pendingTable").getBinding("items");
            var aFilters = [];
            var sTravelType = this.byId("mFilterType").getSelectedKey();
            var sSearch = this.byId("mSearchField").getValue();

            if (sTravelType) {
                aFilters.push(new Filter("travelType", FilterOperator.EQ, sTravelType));
            }
            if (sSearch) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("destination", FilterOperator.Contains, sSearch),
                        new Filter("employeeId", FilterOperator.Contains, sSearch),
                        new Filter("requestId", FilterOperator.Contains, sSearch)
                    ],
                    and: false
                }));
            }

            oBinding.filter(aFilters);
            this._updateTitle(oBinding.getLength());
        },

        // ── SELECTION ──────────────────────────────────────────────────────────

        onSelectionChange: function () {
            var aSelected = this.byId("pendingTable").getSelectedItems();
            var iCount = aSelected.length;
            var oUiModel = this.getView().getModel("uiModel");

            oUiModel.setProperty("/bulkEnabled", iCount > 0);
            oUiModel.setProperty("/selectionText", iCount > 0 ? iCount + " selected" : "");
        },

        // ── SINGLE APPROVE / REJECT ────────────────────────────────────────────

        onApprove: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("managerModel").getObject();
            this._openRemarksDialog("Approve", [oItem]);
        },

        onReject: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("managerModel").getObject();
            this._openRemarksDialog("Reject", [oItem]);
        },

        // ── BULK APPROVE / REJECT ──────────────────────────────────────────────

        onBulkApprove: function () {
            var aItems = this._getSelectedItems();
            if (!aItems.length) return;
            this._openRemarksDialog("Approve", aItems);
        },

        onBulkReject: function () {
            var aItems = this._getSelectedItems();
            if (!aItems.length) return;
            this._openRemarksDialog("Reject", aItems);
        },

        _getSelectedItems: function () {
            return this.byId("pendingTable").getSelectedItems().map(function (oRow) {
                return oRow.getBindingContext("managerModel").getObject();
            });
        },

        // ── REMARKS DIALOG ─────────────────────────────────────────────────────

        _openRemarksDialog: function (sAction, aItems) {
            var that = this;
            var sIds = aItems.map(function (i) { return i.requestId; }).join(", ");

            // Set remarks model
            var oRemarksModel = new JSONModel({
                title: sAction + " Request(s)",
                state: sAction === "Approve" ? "Success" : "Error",
                actionLabel: sAction,
                buttonType: sAction === "Approve" ? "Accept" : "Reject",
                requestIds: sIds,
                remarks: "",
                action: sAction,
                items: aItems
            });
            this.getView().setModel(oRemarksModel, "remarksModel");

            // Load fragment
            if (!this._oRemarksDialog) {
                this._oRemarksDialog = this.loadFragment({
                    name: "com.travel.request.travelrequest.fragment.RemarksDialog"
                });
            }

            this._oRemarksDialog.then(function (oDialog) {
                that._oDialog = oDialog;
                oDialog.open();
            });
        },

        onRemarksConfirm: function () {
            var oRemarksModel = this.getView().getModel("remarksModel");
            var sAction = oRemarksModel.getProperty("/action");
            var aItems = oRemarksModel.getProperty("/items");
            var sRemarks = oRemarksModel.getProperty("/remarks");
            this._oDialog.close();
            this._processAction(sAction, aItems, sRemarks);
        },

        onRemarksCancel: function () {
            this._oDialog.close();
        },

        // ── PROCESS ACTION ─────────────────────────────────────────────────────

        _processAction: function (sAction, aItems, sRemarks) {
            var oUiModel = this.getView().getModel("uiModel");
            var oODataModel = this.getOwnerComponent().getModel();
            var oSharedModel = this.getOwnerComponent().getModel("sharedModel");
            var oManagerModel = this.getView().getModel("managerModel");
            var sNewStatus = sAction === "Approve" ? "Approved" : "Rejected";

            Utils.setBusy(this.getView(), true);

            var iTotal = aItems.length;
            var iCompleted = 0;

            aItems.forEach(function (oItem) {
                oODataModel.update(
                    "/TravelRequests('" + oItem.requestId + "')",
                    {
                        RequestId: oItem.requestId,
                        EmployeeId: oItem.employeeId,
                        TravelType: oItem.travelType,
                        StartDate: oItem.startDate,
                        EndDate: oItem.endDate,
                        Destination: oItem.destination,
                        EstimatedAmount: parseFloat((oItem.estimatedAmount + "").replace(/,/g, "")) || 0,
                        Purpose: oItem.purpose,
                        Status: sNewStatus,
                        Remarks: sRemarks
                    },
                    {
                        success: function () {
                            iCompleted++;

                            // Update sharedModel
                            var aShared = oSharedModel.getProperty("/requests");
                            var iIdx = aShared.findIndex(function (r) {
                                return r.requestId === oItem.requestId;
                            });
                            if (iIdx > -1) {
                                aShared[iIdx].status = sNewStatus;
                                aShared[iIdx].remarks = sRemarks;
                                oSharedModel.setProperty("/requests", aShared);
                            }

                            if (iCompleted === iTotal) {
                                // Remove processed from manager table
                                var aRemaining = oManagerModel.getProperty("/requests").filter(function (r) {
                                    return !aItems.find(function (i) { return i.requestId === r.requestId; });
                                });
                                oManagerModel.setProperty("/requests", aRemaining);
                                Utils.setBusy(this.getView(), false);
                                this.getView().getModel("uiModel").setProperty("/bulkEnabled", false);
                                this.getView().getModel("uiModel").setProperty("/selectionText", "");
                                this._updateTitle(aRemaining.length);
                                MessageToast.show(iTotal + " request(s) " + sNewStatus.toLowerCase() + " successfully.");
                            }
                        }.bind(this),
                        error: function (oError) {
                            Utils.handleError(oError, this.getView());
                        }.bind(this)
                    }
                );
            }.bind(this));
        },

        // ── VIEW DETAILS ───────────────────────────────────────────────────────

        onViewDetails: function (oEvent) {
            var oItem = oEvent.getSource().getBindingContext("managerModel").getObject();
            MessageBox.information(
                "Employee:    " + oItem.employeeId + "\n" +
                "Destination: " + oItem.destination + "\n" +
                "Dates:       " + oItem.startDate + " - " + oItem.endDate + "\n" +
                "Amount:      ₹" + oItem.estimatedAmount + "\n" +
                "Purpose:     " + oItem.purpose,
                { title: "Request Details — " + oItem.requestId }
            );
        },

        onRefresh: function () {
            this.byId("pendingTable").removeSelections(true);
            this.getView().getModel("uiModel").setProperty("/bulkEnabled", false);
            this.getView().getModel("uiModel").setProperty("/selectionText", "");
            this._loadPendingRequests();
            MessageToast.show("Refreshed.");
        },

        // ── HELPERS ────────────────────────────────────────────────────────────

        _updateTitle: function (iCount) {
            Utils.updateTableTitle(this.getView(), "uiModel", "/tableTitle", "Pending Requests", iCount);
        }

    });
});