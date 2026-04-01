sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.travel.request.travelrequest.controller.Dashboard", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("dashboard")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._refreshKPIs();
        },

        _refreshKPIs: function () {
            var oSharedModel = this.getOwnerComponent().getModel("sharedModel");
            var aRequests    = oSharedModel.getProperty("/requests") || [];

            var oKpi = {
                total:    aRequests.length,
                pending:  aRequests.filter(function (r) { return r.status === "Pending";  }).length,
                approved: aRequests.filter(function (r) { return r.status === "Approved"; }).length,
                rejected: aRequests.filter(function (r) { return r.status === "Rejected"; }).length
            };

            var oKpiModel = this.getView().getModel("kpiModel");
            if (!oKpiModel) {
                oKpiModel = new JSONModel(oKpi);
                this.getView().setModel(oKpiModel, "kpiModel");
            } else {
                oKpiModel.setData(oKpi);
            }
        }

    });
});