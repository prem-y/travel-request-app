sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("com.travel.request.travelrequest.controller.App", {

        onInit: function () {
            // Select Dashboard by default
            var oSideNav = this.byId("sideNavigation");
            var oNavList = this.byId("navList");
            oSideNav.setSelectedItem(oNavList.getItems()[0]);
            this._navigateTo("dashboard");
        },

        onToggleSideNav: function () {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        onNavItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            this._navigateTo(sKey);
        },

        _navigateTo: function (sKey) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(sKey);
        }
    });
});