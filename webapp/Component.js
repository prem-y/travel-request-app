sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/util/MockServer",
    "sap/m/MessageBox",
    "com/travel/request/travelrequest/model/models",
    "com/travel/request/travelrequest/model/Session"
], function (UIComponent, JSONModel, ODataModel, MockServer, MessageBox, models, Session) {
    "use strict";

    return UIComponent.extend("com.travel.request.travelrequest.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init: function () {
            // 1. Start MockServer FIRST before anything else
            this._startMockServer();

            // 2. Call base init
            UIComponent.prototype.init.apply(this, arguments);

            // 3. Register models
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(Session.createSessionModel(), "session");
            this._initSharedModel();
            this._registerGlobalErrorHandlers();

            // 4. Start router last
            this.getRouter().initialize();
        },

        _startMockServer: function () {
            var sBase = sap.ui.require.toUrl("com/travel/request/travelrequest");

            var oMockServer = new MockServer({
                rootUri: sBase + "/localService/"
            });

            MockServer.config({
                autoRespond: true,
                autoRespondAfter: 300
            });

            oMockServer.simulate(
                sBase + "/localService/metadata.xml",
                {
                    sMockdataBaseUrl: sBase + "/localService/mockdata",
                    bGenerateMissingMockData: true
                }
            );

            oMockServer.start();

            // Register OData model pointing to same URL
            var oODataModel = new ODataModel({
                serviceUrl: sBase + "/localService/",
                useBatch: false
            });
            this.setModel(oODataModel);

            console.log("MockServer running at: " + sBase + "/localService/");
        },

        _initSharedModel: function () {
            var oSharedModel = new JSONModel({ requests: [] });
            this.setModel(oSharedModel, "sharedModel");

            // Load all requests from OData into sharedModel once at startup
            var oODataModel = this.getModel();
            oODataModel.read("/TravelRequests", {
                success: function (oData) {
                    var aMapped = oData.results.map(function (r) {
                        return {
                            requestId: r.RequestId,
                            employeeId: r.EmployeeId,
                            destination: r.Destination,
                            travelType: r.TravelType,
                            startDate: r.StartDate,
                            endDate: r.EndDate,
                            estimatedAmount: String(r.EstimatedAmount),
                            purpose: r.Purpose,
                            status: r.Status,
                            remarks: r.Remarks || ""
                        };
                    });
                    oSharedModel.setProperty("/requests", aMapped);
                },
                error: function (oError) {
                    console.error("Failed to load initial data:", oError);
                }
            });
        },

        _registerGlobalErrorHandlers: function () {
            sap.ui.getCore().attachParseError(function (oEvent) {
                var sElement = oEvent.getParameter("element").getId() || "field";
                MessageBox.error("Input error on: " + sElement, { title: "Input Error" });
            });

            sap.ui.getCore().attachValidationError(function (oEvent) {
                var oElement = oEvent.getParameter("element");
                if (oElement && oElement.setValueState) {
                    oElement.setValueState("Error");
                    oElement.setValueStateText(oEvent.getParameter("message"));
                }
            });

            sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                var oElement = oEvent.getParameter("element");
                if (oElement && oElement.setValueState) {
                    oElement.setValueState("None");
                }
            });
        }
    });
});