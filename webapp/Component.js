sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "com/travel/request/travelrequest/model/models",
    "com/travel/request/travelrequest/model/Session"
], function (UIComponent, JSONModel, MessageBox, models, Session) {
    "use strict";

    return UIComponent.extend("com.travel.request.travelrequest.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(models.createDeviceModel(), "device");
            // Session model — available globally across all views
            this.setModel(Session.createSessionModel(), "session");
            this._initSharedModel();
            this._registerGlobalErrorHandlers();
            this.getRouter().initialize();
        },

        _initSharedModel: function () {
            var oSharedModel = new JSONModel({
                requests: [
                    {
                        requestId: "TR-0001", employeeId: "EMP-00123",
                        destination: "Mumbai", travelType: "Domestic",
                        startDate: "2026-04-01", endDate: "2026-04-03",
                        estimatedAmount: "8500", purpose: "Client meeting",
                        status: "Approved"
                    },
                    {
                        requestId: "TR-0002", employeeId: "EMP-00123",
                        destination: "Singapore", travelType: "International",
                        startDate: "2026-04-10", endDate: "2026-04-14",
                        estimatedAmount: "75000", purpose: "Tech conference",
                        status: "Pending"
                    },
                    {
                        requestId: "TR-0003", employeeId: "EMP-00123",
                        destination: "Bangalore", travelType: "Domestic",
                        startDate: "2026-04-20", endDate: "2026-04-21",
                        estimatedAmount: "4200", purpose: "Internal training",
                        status: "Draft"
                    },
                    {
                        requestId: "TR-0004", employeeId: "EMP-00123",
                        destination: "Dubai", travelType: "International",
                        startDate: "2026-03-05", endDate: "2026-03-08",
                        estimatedAmount: "55000", purpose: "Partner negotiation",
                        status: "Rejected"
                    },
                    {
                        requestId: "TR-0010", employeeId: "EMP-00456",
                        destination: "Delhi", travelType: "Domestic",
                        startDate: "2026-04-05", endDate: "2026-04-07",
                        estimatedAmount: "12000", purpose: "Government audit",
                        status: "Pending"
                    },
                    {
                        requestId: "TR-0011", employeeId: "EMP-00789",
                        destination: "London", travelType: "International",
                        startDate: "2026-04-15", endDate: "2026-04-20",
                        estimatedAmount: "120000", purpose: "Product launch event",
                        status: "Pending"
                    },
                    {
                        requestId: "TR-0012", employeeId: "EMP-00321",
                        destination: "Hyderabad", travelType: "Domestic",
                        startDate: "2026-04-10", endDate: "2026-04-11",
                        estimatedAmount: "6500", purpose: "Team offsite",
                        status: "Pending"
                    },
                    {
                        requestId: "TR-0020", employeeId: "EMP-00111",
                        destination: "Chennai", travelType: "Domestic",
                        startDate: "2026-03-10", endDate: "2026-03-12",
                        estimatedAmount: "9500", purpose: "Client delivery",
                        status: "Approved"
                    },
                    {
                        requestId: "TR-0021", employeeId: "EMP-00222",
                        destination: "New York", travelType: "International",
                        startDate: "2026-03-15", endDate: "2026-03-20",
                        estimatedAmount: "145000", purpose: "Annual conference",
                        status: "Approved"
                    },
                    {
                        requestId: "TR-0022", employeeId: "EMP-00333",
                        destination: "Pune", travelType: "Domestic",
                        startDate: "2026-03-22", endDate: "2026-03-23",
                        estimatedAmount: "4200", purpose: "Sprint planning",
                        status: "Approved"
                    }
                ]
            });
            this.setModel(oSharedModel, "sharedModel");
        },

        _registerGlobalErrorHandlers: function () {
            var oResourceBundle = this.getModel("i18n").getResourceBundle();

            // Parse errors (wrong data type bound to field)
            sap.ui.getCore().attachParseError(function (oEvent) {
                var sElement = oEvent.getParameter("element").getId() || "field";
                var sMsg = oResourceBundle.getText("errParseError", [sElement]);
                MessageBox.error(sMsg, { title: "Input Error" });
            });

            // Validation errors (constraint violations)
            sap.ui.getCore().attachValidationError(function (oEvent) {
                var oElement = oEvent.getParameter("element");
                if (oElement && oElement.setValueState) {
                    oElement.setValueState("Error");
                    oElement.setValueStateText(oEvent.getParameter("message"));
                }
            });

            // Validation success — clear error state
            sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                var oElement = oEvent.getParameter("element");
                if (oElement && oElement.setValueState) {
                    oElement.setValueState("None");
                }
            });

            // Format errors (formatter throws)
            sap.ui.getCore().attachFormatError(function () {
                MessageBox.error(
                    oResourceBundle.getText("errGeneric"),
                    { title: "Format Error" }
                );
            });
        }
    });
});