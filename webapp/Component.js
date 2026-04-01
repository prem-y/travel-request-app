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

            // Seed shared model with all mock data upfront
            var oSharedModel = new JSONModel({
                requests: [
                    // Employee requests
                    {
                        requestId:       "TR-0001",
                        employeeId:      "EMP-00123",
                        destination:     "Mumbai",
                        travelType:      "Domestic",
                        startDate:       "2026-04-01",
                        endDate:         "2026-04-03",
                        estimatedAmount: "8500",
                        purpose:         "Client meeting",
                        status:          "Approved",
                        statusState:     "Success"
                    },
                    {
                        requestId:       "TR-0002",
                        employeeId:      "EMP-00123",
                        destination:     "Singapore",
                        travelType:      "International",
                        startDate:       "2026-04-10",
                        endDate:         "2026-04-14",
                        estimatedAmount: "75000",
                        purpose:         "Tech conference",
                        status:          "Pending",
                        statusState:     "Warning"
                    },
                    {
                        requestId:       "TR-0003",
                        employeeId:      "EMP-00123",
                        destination:     "Bangalore",
                        travelType:      "Domestic",
                        startDate:       "2026-04-20",
                        endDate:         "2026-04-21",
                        estimatedAmount: "4200",
                        purpose:         "Internal training",
                        status:          "Draft",
                        statusState:     "None"
                    },
                    // Manager pending requests
                    {
                        requestId:       "TR-0010",
                        employeeId:      "EMP-00123",
                        destination:     "Delhi",
                        travelType:      "Domestic",
                        startDate:       "2026-04-05",
                        endDate:         "2026-04-07",
                        estimatedAmount: "12000",
                        purpose:         "Government audit",
                        status:          "Pending",
                        statusState:     "Warning"
                    },
                    {
                        requestId:       "TR-0011",
                        employeeId:      "EMP-00123",
                        destination:     "London",
                        travelType:      "International",
                        startDate:       "2026-04-15",
                        endDate:         "2026-04-20",
                        estimatedAmount: "120000",
                        purpose:         "Product launch event",
                        status:          "Pending",
                        statusState:     "Warning"
                    },
                    {
                        requestId:       "TR-0012",
                        employeeId:      "EMP-00123",
                        destination:     "Hyderabad",
                        travelType:      "Domestic",
                        startDate:       "2026-04-10",
                        endDate:         "2026-04-11",
                        estimatedAmount: "6500",
                        purpose:         "Team offsite",
                        status:          "Pending",
                        statusState:     "Warning"
                    },
                    // Finance approved requests
                    {
                        requestId:       "TR-0020",
                        employeeId:      "EMP-00123",
                        destination:     "Chennai",
                        travelType:      "Domestic",
                        startDate:       "2026-03-10",
                        endDate:         "2026-03-12",
                        estimatedAmount: "9500",
                        purpose:         "Client delivery",
                        status:          "Approved",
                        statusState:     "Success"
                    },
                    {
                        requestId:       "TR-0021",
                        employeeId:      "EMP-00123",
                        destination:     "New York",
                        travelType:      "International",
                        startDate:       "2026-03-15",
                        endDate:         "2026-03-20",
                        estimatedAmount: "145000",
                        purpose:         "Annual conference",
                        status:          "Approved",
                        statusState:     "Success"
                    },
                    {
                        requestId:       "TR-0022",
                        employeeId:      "EMP-00123",
                        destination:     "Pune",
                        travelType:      "Domestic",
                        startDate:       "2026-03-22",
                        endDate:         "2026-03-23",
                        estimatedAmount: "4200",
                        purpose:         "Sprint planning",
                        status:          "Approved",
                        statusState:     "Success"
                    },
                    {
                        requestId:       "TR-0004",
                        employeeId:      "EMP-00123",
                        destination:     "Dubai",
                        travelType:      "International",
                        startDate:       "2026-03-05",
                        endDate:         "2026-03-08",
                        estimatedAmount: "55000",
                        purpose:         "Partner negotiation",
                        status:          "Rejected",
                        statusState:     "Error"
                    }
                ]
            });
            this.setModel(oSharedModel, "sharedModel");

            this.getRouter().initialize();
        }
    });
});