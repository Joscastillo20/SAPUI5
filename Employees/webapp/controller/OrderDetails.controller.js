// @ts-nocheck

// @ts-ignore
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"   

], 

	/**
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
function (Controller, History, MessageBox, Filter, FilterOperator ) {

    function _onObjectMatched(oEvent) {
        this.onClearSignature();
        this.getView().bindElement({
            path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
            model: "oDataNorthwind",
            events: {
                dataReceived: function (oData) {
                    _readSignature.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);

                }.bind(this)
            }
        });

        const objContext = this.getView().getModel("oDataNorthwind").getContext("/Orders("
            + oEvent.getParameter("arguments").OrderID + ")").getObject();
        if (objContext) {
            _readSignature.bind(this)(objContext.OrderID, objContext.EmployeeID);
        }
    };
    function _readSignature(orderId, employeeId) {
        //Read Image
        this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId
            + "',SapId='" + this.getOwnerComponent().SapId
            + "',EmployeeId='" + employeeId + "')", {
            success: function (data) {
                const signature = this.getView().byId("signature");
                if (data.MediaContent !== "") {
                    signature.setSignature("data:image/png;base64," + data.MediaContent);
                }
            }.bind(this),
            error: function () { }
        });
        //Bind Files
        this.byId("uploadCollection").bindAggregation("items", {
            path: "incidenceModel>/FilesSet",
            filters:[
                new Filter("OrderId", FilterOperator.EQ, orderId),
                new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
                new Filter("EmployeeId", FilterOperator.EQ, employeeId),
            ],
            template: new sap.m.UploadCollectionItem({
                documentId: "{incidenceModel>AttId}",
                visibleEdit: false,
                fileName: "{incidenceModel>FileName}"
            }).attachPress(this.downloadFile)
        });
    };

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

        onSaveSignature: function (oEvent) {
            const signature = this.byId("signature");
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            let signaturePng;

            signaturePng = signature.getSignature();
            if (!signature.isFill()) {
                MessageBox.error(oResourceBundle.getText("fillSignature"));
            }
            else {
                signaturePng = signature.getSignature().replace("data:image/png;base64,", "");
                let objectOrder = oEvent.getSource().getBindingContext("oDataNorthwind").getObject();
                let body = {
                    OrderId: objectOrder.OrderID.toString(),
                    SapId: this.getOwnerComponent().SapId,
                    EmployeeId: objectOrder.EmployeeID.toString(),
                    MimeType: "image/png",
                    MediaContent: signaturePng
                };

                this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
                    success: function () {
                        MessageBox.information(oResourceBundle.getText("signatureSaved"));
                    },
                    error: function () {
                        MessageBox.error(oResourceBundle.getText("signatureNotSaved"));
                    },
                });
            };

        },
        onFileBeforeUpload: function(oEvent){
           let fileName = oEvent.getParameter("fileName");
           let objContext =  oEvent.getSource().getBindingContext("oDataNorthwind").getObject();
           let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
               name: "slug",
               value: objContext.OrderID + ";" + this.getOwnerComponent().SapId + ";" + objContext.EmployeeID + ";" + fileName

           });
           oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },
        onFileChange: function(oEvent){
           let oUploadCollection = oEvent.getSource();
           let oCustomerHeaderToken =  new sap.m.UploadCollectionParameter({
               name: "x-csrf-token",
               value: this.getView().getModel("incidenceModel").getSecurityToken()
           });

           oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

        },
        onFileUploadComplete: function(oEvent){
            oEvent.getSource().getBinding("items").refresh();

        },
        onFileDeleted: function(oEvent){
            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();
            this.getView().getModel("incidenceModel").remove(sPath, {
                success: function(){
                     oUploadCollection.getBinding("items").refresh();
                },
                error: function(){

                }
            });
            oEvent.getSource().getBinding("items").refresh();

        },
        downloadFile: function(oEvent){
            const sPath = oEvent.getSource().getBindingContext("incidenceModel").getPath();
            window.open("sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value/");
        }     
    });

});
