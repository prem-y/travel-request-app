sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "com/travel/request/travelrequest/model/models"
], function (UIComponent, JSONModel, models) {
    "use strict";

    return UIComponent.extend("com.travel.request.travelrequest.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(models.createDeviceModel(), "device");

            // Shared travel requests store across all views
            var oSharedModel = new JSONModel({
                requests: []
            });
            this.setModel(oSharedModel, "sharedModel");

            this.getRouter().initialize();
        }
    });
});