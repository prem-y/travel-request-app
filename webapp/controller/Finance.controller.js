sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "com/travel/request/travelrequest/model/formatter",
], function (Controller, JSONModel, MessageToast, formatter) {
    "use strict";

    return Controller.extend("com.travel.request.travelrequest.controller.Finance", {
        formatter: formatter,
        // ── LIFECYCLE ──────────────────────────────────────────────────────────

        onInit: function () {
            this._initModels();
            this.getOwnerComponent().getRouter()
                .getRoute("finance")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._loadApprovedRequests();
        },

        // ── MODELS ─────────────────────────────────────────────────────────────

        _initModels: function () {
            this.getView().setModel(new JSONModel({ requests: [] }), "financeModel");
            this.getView().setModel(new JSONModel({
                busy: false,
                tableTitle: "Approved Requests (0)",
                totalText: "Total: 0 requests",
                amountText: "Total Est. Amount: ₹ 0"
            }), "uiModel");
        },

        // ── LOAD ───────────────────────────────────────────────────────────────

        _loadApprovedRequests: function () {
            var oUiModel = this.getView().getModel("uiModel");
            var oSharedModel = this.getOwnerComponent().getModel("sharedModel");

            oUiModel.setProperty("/busy", true);

            setTimeout(function () {
                var aAll = oSharedModel.getProperty("/requests") || [];
                var aApproved = aAll.filter(function (r) {
                    return r.status === "Approved";
                });

                this._aAllApproved = aApproved;
                this.getView().getModel("financeModel").setProperty("/requests", aApproved);
                oUiModel.setProperty("/busy", false);
                this._updateSummary(aApproved);

            }.bind(this), 600);
        },

        // ── FILTERS ────────────────────────────────────────────────────────────

        onFilterChange: function () {
            this._applyFilters();
        },

        onClearFilters: function () {
            this.byId("dpDateFrom").setValue("");
            this.byId("dpDateTo").setValue("");
            this.byId("fEmpIdInput").setValue("");
            this.byId("fMinAmount").setValue("");
            this.byId("fMaxAmount").setValue("");
            this._applyFilters();
        },

        _applyFilters: function () {
            var sDateFrom = this.byId("dpDateFrom").getValue();
            var sDateTo = this.byId("dpDateTo").getValue();
            var sEmpId = this.byId("fEmpIdInput").getValue().trim().toLowerCase();
            var sMinAmt = this.byId("fMinAmount").getValue();
            var sMaxAmt = this.byId("fMaxAmount").getValue();
            var fMin = sMinAmt ? parseFloat(sMinAmt) : null;
            var fMax = sMaxAmt ? parseFloat(sMaxAmt) : null;

            var aFiltered = (this._aAllApproved || []).filter(function (r) {

                // Date From filter
                if (sDateFrom && r.startDate < sDateFrom) return false;

                // Date To filter
                if (sDateTo && r.endDate > sDateTo) return false;

                // Employee ID filter
                if (sEmpId && !r.employeeId.toLowerCase().includes(sEmpId)) return false;

                // Amount range filter
                var fAmt = parseFloat((r.estimatedAmount + "").replace(/,/g, ""));
                if (fMin !== null && fAmt < fMin) return false;
                if (fMax !== null && fAmt > fMax) return false;

                return true;
            });

            this.getView().getModel("financeModel").setProperty("/requests", aFiltered);
            this._updateSummary(aFiltered);
        },

        // ── ACTIONS ────────────────────────────────────────────────────────────

        onRefresh: function () {
            this.onClearFilters();
            this._loadApprovedRequests();
            MessageToast.show("Refreshed.");
        },

        // ── HELPERS ────────────────────────────────────────────────────────────

        _updateSummary: function (aList) {
            var oUiModel = this.getView().getModel("uiModel");
            var iCount = aList.length;

            var fTotal = aList.reduce(function (sum, r) {
                return sum + parseFloat((r.estimatedAmount + "").replace(/,/g, "") || 0);
            }, 0);

            var sTotalFormatted = fTotal.toLocaleString("en-IN");

            oUiModel.setProperty("/tableTitle", "Approved Requests (" + iCount + ")");
            oUiModel.setProperty("/totalText", "Total: " + iCount + " request(s)");
            oUiModel.setProperty("/amountText", "Total Est. Amount: ₹ " + sTotalFormatted);
        }

    });
});