sap.ui.define([
    "sap/ui/core/util/MockServer"
], function (MockServer) {
    "use strict";

    return {
        init: function () {
            var sBaseUrl = sap.ui.require.toUrl("com/travel/request/travelrequest");
            var sServiceUrl = sBaseUrl + "/localService/";
            var sMetadataUrl = sBaseUrl + "/localService/metadata.xml";
            var sMockdataUrl = sBaseUrl + "/localService/mockdata";

            var oMockServer = new MockServer({ rootUri: sServiceUrl });

            MockServer.config({
                autoRespond: true,
                autoRespondAfter: 300
            });

            oMockServer.simulate(sMetadataUrl, {
                sMockdataBaseUrl: sMockdataUrl,
                bGenerateMissingMockData: true
            });

            oMockServer.start();
            console.log("MockServer started at: " + sServiceUrl);
        }
    };
});