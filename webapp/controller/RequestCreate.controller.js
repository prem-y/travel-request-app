sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/travel/request/travelrequest/model/Utils"
], function (Controller, JSONModel, MessageBox, MessageToast, Utils) {
    "use strict";

    return Controller.extend("com.travel.request.travelrequest.controller.RequestCreate", {

        // ── LIFECYCLE ──────────────────────────────────────────────────────────

        onInit: function () {
            this._initModels();
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("requestCreate").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sId = oEvent.getParameter("arguments").id;

            if (sId) {
                // EDIT mode — load existing request from sharedModel
                this._loadExistingRequest(sId);
            } else {
                // CREATE mode — blank form
                this._resetForm();
            }
        },

        _loadExistingRequest: function (sRequestId) {
            var oSharedModel = this.getOwnerComponent().getModel("sharedModel");
            var aRequests = oSharedModel.getProperty("/requests");

            var oExisting = aRequests.find(function (r) {
                return r.requestId === sRequestId;
            });

            if (oExisting) {
                this.getView().getModel("requestModel").setData(
                    Object.assign({}, oExisting)
                );
                // Store requestId for update later
                this._sEditRequestId = sRequestId;
            } else {
                this._resetForm();
            }
        },

        // ── MODEL SETUP ────────────────────────────────────────────────────────

        _initModels: function () {

            // 1. Request Model (JSON) — holds form field values (two-way binding)
            var oRequestModel = new JSONModel({
                employeeId: this.getOwnerComponent().getModel("session").getProperty("/employeeId"),
                travelType: "Domestic",
                startDate: "",
                endDate: "",
                destination: "",
                estimatedAmount: "",
                purpose: "",
                status: "Draft",
                statusState: "None",
                createdOn: this._today(),
                amountState: "None",
                amountStateText: ""
            });
            oRequestModel.setDefaultBindingMode("TwoWay");
            this.getView().setModel(oRequestModel, "requestModel");

            // 2. UI State Model — controls validation states, busy, button states
            var oUiModel = new JSONModel({
                busy: false,
                submitEnabled: true,
                today: new Date(),
                startDateState: "None",
                endDateState: "None",
                destinationState: "None",
                purposeState: "None"
            });
            this.getView().setModel(oUiModel, "uiModel");
        },

        _resetForm: function () {
            var oRequestModel = this.getView().getModel("requestModel");
            oRequestModel.setData({
                employeeId: "EMP-00123",
                travelType: "Domestic",
                startDate: "",
                endDate: "",
                destination: "",
                estimatedAmount: "",
                purpose: "",
                status: "Draft",
                statusState: "None",
                createdOn: this._today()
            });
            this._clearValidation();
        },

        // ── FIELD EVENTS ───────────────────────────────────────────────────────

        onTravelTypeChange: function () {
            // Hook for future logic (e.g. show visa fields for International)
        },

        onDateChange: function () {
            this._validateDates();
        },

        onFieldChange: function () {
            // Clear validation state on edit
            var oUiModel = this.getView().getModel("uiModel");
            oUiModel.setProperty("/destinationState", "None");
            oUiModel.setProperty("/purposeState", "None");
        },

        // ── ACTIONS ────────────────────────────────────────────────────────────

        onSaveDraft: function () {
            var oData = this.getView().getModel("requestModel").getData();
            this._submitToOData(oData, "Draft");
        },

        onSubmit: function () {
            if (!this._validateAll()) return;
            var oData = this.getView().getModel("requestModel").getData();

            MessageBox.confirm("Are you sure you want to submit this travel request?", {
                title: "Confirm Submission",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._submitToOData(oData, "Pending");
                    }
                }.bind(this)
            });
        },

        onCancel: function () {
            MessageBox.confirm("Discard changes?", {
                title: "Cancel",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._sEditRequestId = null;
                        this.getOwnerComponent().getRouter().navTo("employee");
                    }
                }.bind(this)
            });
        },

        // ── ODATA MOCK ─────────────────────────────────────────────────────────

        _submitToOData: function (oData, sStatus) {
            var oUiModel = this.getView().getModel("uiModel");

            // Show busy indicator
            oUiModel.setProperty("/busy", true);
            oUiModel.setProperty("/submitEnabled", false);

            // Simulate OData Create call (replace with real v2/v4 call)
            setTimeout(function () {
                try {
                    // ── Real OData v2 call would look like: ──────────────────
                    // var oODataModel = this.getOwnerComponent().getModel();
                    // oODataModel.create("/TravelRequests", {
                    //     EmployeeId:      oData.employeeId,
                    //     TravelType:      oData.travelType,
                    //     StartDate:       oData.startDate,
                    //     EndDate:         oData.endDate,
                    //     Destination:     oData.destination,
                    //     EstimatedAmount: parseFloat(oData.estimatedAmount),
                    //     Purpose:         oData.purpose,
                    //     Status:          sStatus
                    // }, {
                    //     success: function(oResult) { ... },
                    //     error:   function(oError)  { ... }
                    // });
                    // ────────────────────────────────────────────────────────

                    // Mock success
                    oUiModel.setProperty("/busy", false);
                    oUiModel.setProperty("/submitEnabled", true);

                    // Push to shared model
                    var oSharedModel = this.getOwnerComponent().getModel("sharedModel");
                    var aRequests = oSharedModel.getProperty("/requests");

                    if (this._sEditRequestId) {
                        // UPDATE existing request
                        var iIndex = aRequests.findIndex(function (r) {
                            return r.requestId === this._sEditRequestId;
                        }.bind(this));

                        if (iIndex > -1) {
                            aRequests[iIndex] = {
                                requestId: this._sEditRequestId,
                                employeeId: oData.employeeId,   // ADD THIS
                                destination: oData.destination,
                                travelType: oData.travelType,
                                startDate: oData.startDate,
                                endDate: oData.endDate,
                                estimatedAmount: oData.estimatedAmount,
                                purpose: oData.purpose,
                                status: sStatus,
                                statusState: sStatus === "Pending" ? "Warning"
                                    : sStatus === "Draft" ? "None"
                                        : "Success"
                            };
                            oSharedModel.setProperty("/requests", aRequests);
                        }
                        this._sEditRequestId = null;

                    } else {
                        // CREATE new request
                        var oNewRequest = {
                            requestId: Utils.generateRequestId(aRequests),
                            employeeId: oData.employeeId,   // ADD THIS
                            destination: oData.destination,
                            travelType: oData.travelType,
                            startDate: oData.startDate,
                            endDate: oData.endDate,
                            estimatedAmount: oData.estimatedAmount,
                            purpose: oData.purpose,
                            status: sStatus,
                            statusState: sStatus === "Pending" ? "Warning"
                                : sStatus === "Draft" ? "None"
                                    : "Success"
                        };
                        aRequests.push(oNewRequest);
                        oSharedModel.setProperty("/requests", aRequests);

                        // Track this requestId so subsequent saves update the same entry
                        this._sEditRequestId = oNewRequest.requestId;
                    }

                    if (sStatus === "Draft") {
                        // Do NOT reset _sEditRequestId here — keep tracking for further edits
                        MessageToast.show("Request saved as Draft successfully.");
                    } else {
                        // Reset on final submit
                        this._sEditRequestId = null;
                        MessageBox.success("Travel request submitted successfully!", {
                            onClose: function () {
                                this.getOwnerComponent().getRouter().navTo("employee");
                            }.bind(this)
                        });
                    }

                } catch (oError) {
                    this._handleODataError(oError);
                }
            }.bind(this), 1500); // Simulated network delay
        },

        // ── ERROR HANDLING ─────────────────────────────────────────────────────

        _handleODataError: function (oError) {
            var oUiModel = this.getView().getModel("uiModel");
            oUiModel.setProperty("/busy", false);
            oUiModel.setProperty("/submitEnabled", true);

            var sMessage = "An error occurred while saving the request.";
            if (oError && oError.message) {
                sMessage = oError.message;
            }

            MessageBox.error(sMessage, {
                title: "Submission Failed",
                details: oError ? JSON.stringify(oError, null, 2) : ""
            });
        },

        // ── VALIDATION ─────────────────────────────────────────────────────────

        _validateAll: function () {
            var bValid = true;
            var oModel = this.getView().getModel("requestModel");
            var oUiModel = this.getView().getModel("uiModel");
            var oData = oModel.getData();

            // Destination
            if (!oData.destination || oData.destination.trim() === "") {
                oUiModel.setProperty("/destinationState", "Error");
                bValid = false;
            }

            // Purpose
            if (!oData.purpose || oData.purpose.trim() === "") {
                oUiModel.setProperty("/purposeState", "Error");
                bValid = false;
            }

            // Amount validation
            var sAmount = oData.estimatedAmount;
            if (sAmount !== "" && sAmount !== undefined) {
                var fAmount = parseFloat((sAmount + "").replace(/,/g, ""));
                if (isNaN(fAmount)) {
                    oUiModel.setProperty("/amountState", "Error");
                    oUiModel.setProperty("/amountStateText", "Amount must be a valid number");
                    bValid = false;
                } else if (fAmount <= 0) {
                    oUiModel.setProperty("/amountState", "Error");
                    oUiModel.setProperty("/amountStateText", "Amount must be greater than 0");
                    bValid = false;
                } else if (fAmount > 9999999) {
                    oUiModel.setProperty("/amountState", "Error");
                    oUiModel.setProperty("/amountStateText", "Amount cannot exceed ₹ 99,99,999");
                    bValid = false;
                } else {
                    oUiModel.setProperty("/amountState", "None");
                }
            }

            // Dates
            if (!this._validateDates()) bValid = false;

            if (!bValid) {
                MessageToast.show("Please fill all mandatory fields.");
            }

            return bValid;
        },

        _validateDates: function () {
            var oModel = this.getView().getModel("requestModel");
            var oUiModel = this.getView().getModel("uiModel");
            var sStart = oModel.getProperty("/startDate");
            var sEnd = oModel.getProperty("/endDate");
            var bValid = true;

            if (!sStart) {
                oUiModel.setProperty("/startDateState", "Error");
                bValid = false;
            } else {
                oUiModel.setProperty("/startDateState", "None");
            }

            if (!sEnd || (sStart && sEnd <= sStart)) {
                oUiModel.setProperty("/endDateState", "Error");
                bValid = false;
            } else {
                oUiModel.setProperty("/endDateState", "None");
            }

            return bValid;
        },

        _clearValidation: function () {
            var oUiModel = this.getView().getModel("uiModel");
            oUiModel.setProperty("/startDateState", "None");
            oUiModel.setProperty("/endDateState", "None");
            oUiModel.setProperty("/destinationState", "None");
            oUiModel.setProperty("/purposeState", "None");
            oUiModel.setProperty("/amountState", "None");
            oUiModel.setProperty("/amountStateText", "");
        },

        // ── HELPERS ────────────────────────────────────────────────────────────

        _today: function () {
            return new Date().toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric"
            });
        }

    });
});