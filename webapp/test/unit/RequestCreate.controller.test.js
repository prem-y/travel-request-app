sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/travel/request/travelrequest/model/formatter",
    "com/travel/request/travelrequest/model/Utils"
], function (Controller, JSONModel, formatter, Utils) {
    "use strict";

    // ── Helpers ────────────────────────────────────────────────────────────────

    // Build a minimal mock view with two models
    function _createMockView(oRequestData, oUiData) {
        var oModels = {};

        var oRequestModel = new JSONModel(oRequestData || {
            employeeId: "EMP-00123",
            travelType: "Domestic",
            startDate: "",
            endDate: "",
            destination: "",
            estimatedAmount: "",
            purpose: "",
            status: "Draft"
        });

        var oUiModel = new JSONModel(oUiData || {
            busy: false,
            submitEnabled: true,
            startDateState: "None",
            endDateState: "None",
            destinationState: "None",
            purposeState: "None",
            amountState: "None",
            amountStateText: ""
        });

        oModels["requestModel"] = oRequestModel;
        oModels["uiModel"] = oUiModel;

        return {
            getModel: function (sName) { return oModels[sName]; },
            setModel: function (oModel, sName) { oModels[sName] = oModel; }
        };
    }

    // Simulate _validateAll logic extracted for testing
    function _validateAll(oView) {
        var oModel = oView.getModel("requestModel");
        var oUiModel = oView.getModel("uiModel");
        var oData = oModel.getData();
        var bValid = true;

        // Destination
        if (!oData.destination || oData.destination.trim() === "") {
            oUiModel.setProperty("/destinationState", "Error");
            bValid = false;
        } else {
            oUiModel.setProperty("/destinationState", "None");
        }

        // Purpose
        if (!oData.purpose || oData.purpose.trim() === "") {
            oUiModel.setProperty("/purposeState", "Error");
            bValid = false;
        } else {
            oUiModel.setProperty("/purposeState", "None");
        }

        // Start date
        if (!oData.startDate) {
            oUiModel.setProperty("/startDateState", "Error");
            bValid = false;
        } else {
            oUiModel.setProperty("/startDateState", "None");
        }

        // End date
        if (!oData.endDate || oData.endDate <= oData.startDate) {
            oUiModel.setProperty("/endDateState", "Error");
            bValid = false;
        } else {
            oUiModel.setProperty("/endDateState", "None");
        }

        // Amount
        if (oData.estimatedAmount !== "" && oData.estimatedAmount !== undefined) {
            var fAmount = parseFloat((oData.estimatedAmount + "").replace(/,/g, ""));
            if (isNaN(fAmount) || fAmount <= 0) {
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

        return bValid;
    }

    // ── Module: Validation ─────────────────────────────────────────────────────

    QUnit.module("RequestCreate — Validation", {
        beforeEach: function () {
            this.oView = _createMockView();
        },
        afterEach: function () {
            this.oView = null;
        }
    });

    QUnit.test("validateAll: empty form returns false", function (assert) {
        var bResult = _validateAll(this.oView);
        assert.strictEqual(bResult, false, "Empty form should be invalid");
    });

    QUnit.test("validateAll: missing destination sets Error state", function (assert) {
        _validateAll(this.oView);
        assert.strictEqual(
            this.oView.getModel("uiModel").getProperty("/destinationState"),
            "Error",
            "destinationState should be Error"
        );
    });

    QUnit.test("validateAll: missing purpose sets Error state", function (assert) {
        _validateAll(this.oView);
        assert.strictEqual(
            this.oView.getModel("uiModel").getProperty("/purposeState"),
            "Error",
            "purposeState should be Error"
        );
    });

    QUnit.test("validateAll: missing start date sets Error state", function (assert) {
        _validateAll(this.oView);
        assert.strictEqual(
            this.oView.getModel("uiModel").getProperty("/startDateState"),
            "Error"
        );
    });

    QUnit.test("validateAll: end date before start date sets Error state", function (assert) {
        this.oView.getModel("requestModel").setData({
            destination: "Mumbai",
            purpose: "Test",
            startDate: "2026-04-10",
            endDate: "2026-04-05",
            estimatedAmount: "5000"
        });
        _validateAll(this.oView);
        assert.strictEqual(
            this.oView.getModel("uiModel").getProperty("/endDateState"),
            "Error",
            "End date before start date should be invalid"
        );
    });

    QUnit.test("validateAll: fully valid form returns true", function (assert) {
        this.oView.getModel("requestModel").setData({
            destination: "Mumbai",
            purpose: "Client meeting",
            startDate: "2026-04-01",
            endDate: "2026-04-05",
            estimatedAmount: "8500"
        });
        var bResult = _validateAll(this.oView);
        assert.strictEqual(bResult, true, "Valid form should return true");
    });

    QUnit.test("validateAll: all states None on valid form", function (assert) {
        this.oView.getModel("requestModel").setData({
            destination: "Delhi",
            purpose: "Audit",
            startDate: "2026-04-01",
            endDate: "2026-04-05",
            estimatedAmount: "12000"
        });
        _validateAll(this.oView);
        var oUi = this.oView.getModel("uiModel");
        assert.strictEqual(oUi.getProperty("/destinationState"), "None");
        assert.strictEqual(oUi.getProperty("/purposeState"), "None");
        assert.strictEqual(oUi.getProperty("/startDateState"), "None");
        assert.strictEqual(oUi.getProperty("/endDateState"), "None");
        assert.strictEqual(oUi.getProperty("/amountState"), "None");
    });

    // ── Module: Amount Validation ──────────────────────────────────────────────

    QUnit.module("RequestCreate — Amount Validation", {
        beforeEach: function () {
            this.oView = _createMockView({
                destination: "Mumbai",
                purpose: "Test",
                startDate: "2026-04-01",
                endDate: "2026-04-05",
                estimatedAmount: ""
            });
        }
    });

    QUnit.test("amount: zero value sets Error", function (assert) {
        this.oView.getModel("requestModel").setProperty("/estimatedAmount", "0");
        _validateAll(this.oView);
        assert.strictEqual(this.oView.getModel("uiModel").getProperty("/amountState"), "Error");
    });

    QUnit.test("amount: negative value sets Error", function (assert) {
        this.oView.getModel("requestModel").setProperty("/estimatedAmount", "-500");
        _validateAll(this.oView);
        assert.strictEqual(this.oView.getModel("uiModel").getProperty("/amountState"), "Error");
    });

    QUnit.test("amount: above max sets Error", function (assert) {
        this.oView.getModel("requestModel").setProperty("/estimatedAmount", "99999999");
        _validateAll(this.oView);
        assert.strictEqual(this.oView.getModel("uiModel").getProperty("/amountState"), "Error");
    });

    QUnit.test("amount: non-numeric sets Error", function (assert) {
        this.oView.getModel("requestModel").setProperty("/estimatedAmount", "abc");
        _validateAll(this.oView);
        assert.strictEqual(this.oView.getModel("uiModel").getProperty("/amountState"), "Error");
    });

    QUnit.test("amount: valid amount sets None", function (assert) {
        this.oView.getModel("requestModel").setProperty("/estimatedAmount", "5000");
        _validateAll(this.oView);
        assert.strictEqual(this.oView.getModel("uiModel").getProperty("/amountState"), "None");
    });

    QUnit.test("amount: empty string skips validation — no Error", function (assert) {
        this.oView.getModel("requestModel").setProperty("/estimatedAmount", "");
        _validateAll(this.oView);
        assert.strictEqual(this.oView.getModel("uiModel").getProperty("/amountState"), "None");
    });

    // ── Module: Utils ──────────────────────────────────────────────────────────

    QUnit.module("Utils.js");

    QUnit.test("generateRequestId: returns next ID from list", function (assert) {
        var aRequests = [
            { requestId: "TR-0001" },
            { requestId: "TR-0002" },
            { requestId: "TR-0003" }
        ];
        assert.strictEqual(Utils.generateRequestId(aRequests), "TR-0004");
    });

    QUnit.test("generateRequestId: empty list returns TR-0001", function (assert) {
        assert.strictEqual(Utils.generateRequestId([]), "TR-0001");
    });

    QUnit.test("parseAmount: parses plain number", function (assert) {
        assert.strictEqual(Utils.parseAmount("8500"), 8500);
    });

    QUnit.test("parseAmount: strips commas before parsing", function (assert) {
        assert.strictEqual(Utils.parseAmount("1,20,000"), 120000);
    });

    QUnit.test("parseAmount: returns 0 for empty string", function (assert) {
        assert.strictEqual(Utils.parseAmount(""), 0);
    });

    QUnit.test("parseAmount: returns 0 for non-numeric", function (assert) {
        assert.strictEqual(Utils.parseAmount("abc"), 0);
    });

    QUnit.test("formatINR: formats number as INR string", function (assert) {
        assert.strictEqual(Utils.formatINR("8500"), "₹ 8,500");
    });

});