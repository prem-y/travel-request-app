sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/ActionSheet",
    "sap/m/Button"
], function (Controller, ActionSheet, Button) {
    "use strict";

    // Define menus per module
    var oModuleMenus = {
        Employee: [
            { text: "Dashboard", icon: "sap-icon://home", key: "dashboard" },
            { text: "Create Travel Request", icon: "sap-icon://create", key: "requestCreate" },
            { text: "View My Requests", icon: "sap-icon://detail-view", key: "employee" }
        ],
        Manager: [
            { text: "Dashboard", icon: "sap-icon://home", key: "dashboard" },
            { text: "Approve / Reject", icon: "sap-icon://task", key: "manager" }
        ],
        Finance: [
            { text: "Dashboard", icon: "sap-icon://home", key: "dashboard" },
            { text: "Finance View", icon: "sap-icon://money-bills", key: "finance" }
        ]
    };

    return Controller.extend("com.travel.request.travelrequest.controller.App", {

        onInit: function () {
            // Default module
            this._sCurrentModule = "Employee";
            this._applyModule("Employee");

            // Select Dashboard by default
            var oNavList = this.byId("navList");
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

        // Open ActionSheet to pick module
        onModuleSwitchPress: function (oEvent) {
            var oButton = oEvent.getSource();
            var that = this;

            if (!this._oModuleActionSheet) {
                this._oModuleActionSheet = new ActionSheet({
                    title: "Select Module",
                    buttons: [
                        new Button({
                            text: "Employee",
                            icon: "sap-icon://employee",
                            press: function () { that._applyModule("Employee"); }
                        }),
                        new Button({
                            text: "Manager",
                            icon: "sap-icon://manager",
                            press: function () { that._applyModule("Manager"); }
                        }),
                        new Button({
                            text: "Finance",
                            icon: "sap-icon://money-bills",
                            press: function () { that._applyModule("Finance"); }
                        })
                    ]
                });
                this.getView().addDependent(this._oModuleActionSheet);
            }

            this._oModuleActionSheet.openBy(oButton);
        },

        // Apply module: update label + drawer menu
        _applyModule: function (sModule) {
            this._sCurrentModule = sModule;

            // Update module label in toolbar
            this.byId("moduleLabel").setText("| " + sModule);

            // Get menu config for this module
            var aMenuItems = oModuleMenus[sModule];
            var oNavList = this.byId("navList");
            var aNavItems = oNavList.getItems();

            // Hide all items first
            aNavItems.forEach(function (oItem) {
                oItem.setVisible(false);
            });

            // Show + update items for selected module
            aMenuItems.forEach(function (oMenuDef, i) {
                if (aNavItems[i]) {
                    aNavItems[i].setText(oMenuDef.text);
                    aNavItems[i].setIcon(oMenuDef.icon);
                    aNavItems[i].setKey(oMenuDef.key);
                    aNavItems[i].setVisible(true);
                }
            });

            // Always navigate to dashboard on module switch
            this._navigateTo("dashboard");
            oNavList.setSelectedItem(oNavList.getItems()[0]);
        },

        _navigateTo: function (sKey) {
            this.getOwnerComponent().getRouter().navTo(sKey);
        }
    });
});