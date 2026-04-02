sap.ui.define([], function () {
    "use strict";

    return {

        // Returns ObjectStatus state from status string
        // Used in views: {formatter:statusState(status)}
        statusState: function (sStatus) {
            var mStates = {
                "Approved": "Success",
                "Pending": "Warning",
                "Rejected": "Error",
                "Draft": "None"
            };
            return mStates[sStatus] || "None";
        },

        // Returns a human readable status text
        statusText: function (sStatus) {
            var mTexts = {
                "Approved": "Approved",
                "Pending": "Pending Approval",
                "Rejected": "Rejected",
                "Draft": "Draft"
            };
            return mTexts[sStatus] || sStatus;
        },

        // Format amount with INR symbol and commas
        formatAmount: function (sAmount) {
            if (!sAmount) return "₹ 0";
            var fAmount = parseFloat((sAmount + "").replace(/,/g, ""));
            if (isNaN(fAmount)) return "₹ 0";
            return "₹ " + fAmount.toLocaleString("en-IN");
        },

        // Returns visible state — true only for Draft status
        isDraft: function (sStatus) {
            return sStatus === "Draft";
        }

    };
});