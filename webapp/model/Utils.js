sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (MessageBox, MessageToast) {
    "use strict";

    return {

        // Standard OData error handler
        // Call: Utils.handleError(oError, oView)
        handleError: function (oError, oView) {
            var oUiModel = oView && oView.getModel("uiModel");
            if (oUiModel) {
                oUiModel.setProperty("/busy", false);
                oUiModel.setProperty("/submitEnabled", true);
            }

            var sMessage = "An unexpected error occurred. Please try again.";

            // OData v2 error body parsing
            if (oError && oError.responseText) {
                try {
                    var oBody = JSON.parse(oError.responseText);
                    sMessage = oBody.error && oBody.error.message
                        ? oBody.error.message.value || oBody.error.message
                        : sMessage;
                } catch (e) {
                    sMessage = oError.responseText;
                }
            } else if (oError && oError.message) {
                sMessage = oError.message;
            }

            MessageBox.error(sMessage, {
                title: "Error",
                details: oError ? JSON.stringify(oError, null, 2) : ""
            });
        },

        // Update table title with count
        // Call: Utils.updateTableTitle(oView, "uiModel", "/tableTitle", "My Requests", iCount)
        updateTableTitle: function (oView, sModelName, sPath, sLabel, iCount) {
            oView.getModel(sModelName)
                .setProperty(sPath, sLabel + " (" + iCount + ")");
        },

        // Show busy on a view's uiModel
        setBusy: function (oView, bBusy) {
            var oUiModel = oView.getModel("uiModel");
            if (oUiModel) oUiModel.setProperty("/busy", bBusy);
        },

        // Generate next request ID from existing list
        generateRequestId: function (aRequests) {
            var iMax = aRequests.reduce(function (max, r) {
                var iNum = parseInt((r.requestId || "").replace("TR-00", ""), 10);
                return isNaN(iNum) ? max : Math.max(max, iNum);
            }, 0);
            return "TR-00" + (iMax + 1).toString().padStart(2, "0");
        },

        // Strip commas and parse float safely
        parseAmount: function (sValue) {
            if (!sValue) return 0;
            var f = parseFloat((sValue + "").replace(/,/g, ""));
            return isNaN(f) ? 0 : f;
        },

        // Format number as INR string
        formatINR: function (sValue) {
            var f = this.parseAmount(sValue);
            return "₹ " + f.toLocaleString("en-IN");
        },

        // Show a MessageToast safely
        showToast: function (sMessage) {
            MessageToast.show(sMessage);
        }

    };
});