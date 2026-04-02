sap.ui.define([
    "com/travel/request/travelrequest/model/formatter"
], function (formatter) {
    "use strict";

    QUnit.module("formatter.js", {
        beforeEach: function () { },
        afterEach: function () { }
    });

    // ── statusState ────────────────────────────────────────────────────────────

    QUnit.test("statusState: Approved returns Success", function (assert) {
        assert.strictEqual(formatter.statusState("Approved"), "Success");
    });

    QUnit.test("statusState: Pending returns Warning", function (assert) {
        assert.strictEqual(formatter.statusState("Pending"), "Warning");
    });

    QUnit.test("statusState: Rejected returns Error", function (assert) {
        assert.strictEqual(formatter.statusState("Rejected"), "Error");
    });

    QUnit.test("statusState: Draft returns None", function (assert) {
        assert.strictEqual(formatter.statusState("Draft"), "None");
    });

    QUnit.test("statusState: unknown status returns None", function (assert) {
        assert.strictEqual(formatter.statusState("SomeUnknown"), "None");
    });

    QUnit.test("statusState: empty string returns None", function (assert) {
        assert.strictEqual(formatter.statusState(""), "None");
    });

    QUnit.test("statusState: undefined returns None", function (assert) {
        assert.strictEqual(formatter.statusState(undefined), "None");
    });

    // ── statusText ─────────────────────────────────────────────────────────────

    QUnit.test("statusText: Pending returns Pending Approval", function (assert) {
        assert.strictEqual(formatter.statusText("Pending"), "Pending Approval");
    });

    QUnit.test("statusText: Approved returns Approved", function (assert) {
        assert.strictEqual(formatter.statusText("Approved"), "Approved");
    });

    QUnit.test("statusText: Rejected returns Rejected", function (assert) {
        assert.strictEqual(formatter.statusText("Rejected"), "Rejected");
    });

    QUnit.test("statusText: Draft returns Draft", function (assert) {
        assert.strictEqual(formatter.statusText("Draft"), "Draft");
    });

    QUnit.test("statusText: unknown falls back to raw value", function (assert) {
        assert.strictEqual(formatter.statusText("Custom"), "Custom");
    });

    // ── formatAmount ───────────────────────────────────────────────────────────

    QUnit.test("formatAmount: numeric string formats correctly", function (assert) {
        assert.strictEqual(formatter.formatAmount("8500"), "₹ 8,500");
    });

    QUnit.test("formatAmount: large amount formats with commas", function (assert) {
        assert.strictEqual(formatter.formatAmount("120000"), "₹ 1,20,000");
    });

    QUnit.test("formatAmount: comma-separated string parses correctly", function (assert) {
        assert.strictEqual(formatter.formatAmount("1,20,000"), "₹ 1,20,000");
    });

    QUnit.test("formatAmount: empty string returns ₹ 0", function (assert) {
        assert.strictEqual(formatter.formatAmount(""), "₹ 0");
    });

    QUnit.test("formatAmount: undefined returns ₹ 0", function (assert) {
        assert.strictEqual(formatter.formatAmount(undefined), "₹ 0");
    });

    QUnit.test("formatAmount: non-numeric string returns ₹ 0", function (assert) {
        assert.strictEqual(formatter.formatAmount("abc"), "₹ 0");
    });

    // ── isDraft ────────────────────────────────────────────────────────────────

    QUnit.test("isDraft: Draft returns true", function (assert) {
        assert.strictEqual(formatter.isDraft("Draft"), true);
    });

    QUnit.test("isDraft: Approved returns false", function (assert) {
        assert.strictEqual(formatter.isDraft("Approved"), false);
    });

    QUnit.test("isDraft: Pending returns false", function (assert) {
        assert.strictEqual(formatter.isDraft("Pending"), false);
    });

    QUnit.test("isDraft: empty string returns false", function (assert) {
        assert.strictEqual(formatter.isDraft(""), false);
    });

});