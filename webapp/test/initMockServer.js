sap.ui.define([
    "com/travel/request/travelrequest/localService/mockserver",
    "sap/ui/model/odata/v2/ODataModel"
], function (mockserver, ODataModel) {
    "use strict";

    mockserver.init();

    sap.ui.getCore().attachInit(function () {
        var oModel = new ODataModel({
            serviceUrl: "/com/travel/request/travelrequest/localService/",
            useBatch:   false
        });

        sap.ui.require(["sap/ui/core/ComponentSupport"]);
    });
});