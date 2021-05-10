// @ts-nocheck

// @ts-ignore
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"
], function (Controller, History, MessageBox) {

    function _onObjectMatched(oEvent) {

        this.getView().bindElement({
            path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
            model: "oDataNorthwind"
        });
    }
    return Controller.extend("logaligroup.Employees.controller.orderDetails", {



        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
        },
        onBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // @ts-ignore
                oRouter.navTo("RouteMain", true);
            }
        },
        onClearSignature: function () {

            var signature = this.byId("signature");
            signature.clear();
        },

        factoryOrderDetails: function (listId, oContext) {
            var contextObject = oContext.getObject();
            contextObject.Currency = "EUR";
            var unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

            if (contextObject.Quantity <= unitsInStock) {

                var objectListItem = new sap.m.ObjectListItem({
                    title: "{oDataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({oDataNorthwind>Quantity})",
                    number: "{parts: [{path: 'oDataNorthwind>UnitPrice'}, {path: 'oDataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure: false}}",
                    numberUnit: "{oDataNorthwind>Currency}"
                });
                return objectListItem;

            } else {
                var customListItem = new sap.m.CustomListItem({
                    content: [

                        new sap.m.Bar({

                            contentLeft: new sap.m.Label({ text: "{oDataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({oDataNorthwind>Quantity})" }),
                            contentMiddle: new sap.m.ObjectStatus({
                                text: "{i18n>avalaibleStock} {oDataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}",
                                state: "Error"
                            }),
                            contentRight: new sap.m.Label({ text: "{parts: [{path: 'oDataNorthwind>UnitPrice'}, {path: 'oDataNorthwind>Currency'}] , type: 'sap.ui.model.type.Currency'}" })
                        })
                    ]
                });

                return customListItem;
            }

        },
        
        onSaveSignature: function (oEvent){
          const signature = this.byId("signature");
          const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
          let signaturePng;

          if (!signature.isFill()){
              MessageBox.error(oResourceBundle.getText("fillSignature"));
          }
          else{
              signaturePng = signature.getSignature();
          }

        }
    });

});
