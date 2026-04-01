sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    return {

        createSessionModel: function () {

            var oSessionModel = new JSONModel({
                employeeId: "EMP-00123",
                userName: "Demo User",
                initials: "DU",
                role: "Employee",     // Employee | Manager | Finance
                email: "emp@company.com"
            });

            oSessionModel.setDefaultBindingMode("OneWay");
            return oSessionModel;
        }

    };
});