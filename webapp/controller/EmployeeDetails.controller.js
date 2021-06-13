sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller) {
        "use strict";

        function onInit() {
         this._bus = sap.ui.getCore().getEventBus();   

        };
 

        function onAfterRendering() {

        };

    //Eliminar Empleado    
        function onDeleteEmployee(oEvent) {

            //Se muestra un mensaje de confirmación
            this.employeeId = oEvent.getSource().getBindingContext("odataModel").getObject().EmployeeId;

            sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("estaSeguroEliminar"), {
                title: this.getView().getModel("i18n").getResourceBundle().getText("confirm"),
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //Se llama a la función remove
                        this.getView().getModel("odataModel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                            success: function (data) {
                                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("seHaEliminadoUsuario"));
                                //En el detalle se muestra el mensaje "Seleecione empleado"
                                //	this._splitAppEmployee.to(this.createId("detailSelectEmployee"));
                            }.bind(this),
                            error: function (e) {
                                sap.base.Log.info(e);
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });

        }


        //Función para ascender a un empleado
        function onRiseEmployee(oEvent) {
            if (!this.riseDialog) {

                this.riseDialog = sap.ui.xmlfragment("PF/rrhh/fragment/RiseEmployee", this);
                this.getView().addDependent(this.riseDialog);
            }
            this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}), "newRise");
            this.riseDialog.open();
        }


        //Función para cerrar el dialogo
        function onCloseRiseDialog() {
            this.riseDialog.close();
        }

        //Función para crear un nuevo ascenso
        function addRise(oEvent) {

            this.employeeId = oEvent.getSource().getBindingContext("odataModel").getObject().EmployeeId;
            //Se obtiene el modelo newRise
            var newRise = this.riseDialog.getModel("newRise");
            //Se obtiene los datos
            var odata = newRise.getData();
            //Se prepara la informacion para enviar a sap y se agrega el campo sapId con el id del component y el id del empleado
            var body = {
                Ammount: odata.Ammount,
                CreationDate: odata.CreationDate,
                Comments: odata.Comments,
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: this.employeeId
            };
            this.getView().setBusy(true);
            this.getView().getModel("odataModel").create("/Salaries", body, {
                success: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrectamente"));
                    this.onCloseRiseDialog();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoErroneo"));
                }.bind(this)
            });

        }


        //La clave del slug se construye con el SapId declarado en el component  
        function onFileBeforeUpload(oEvent) {
            
            this.employeeId = oEvent.getSource().getBindingContext("odataModel").getObject().EmployeeId;
            
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.employeeId + ";" + oEvent.getParameter("fileName")

            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        };

        function onFileChange(oEvent) {
            let oUploadCollection = oEvent.getSource();
            //Header Token
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataModel").getSecurityToken()
            });

            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

        };

        function onFileUploadComplete(oEvent) {
            oEvent.getSource().getBinding("items").refresh();

        };
        function onFileDeleted(oEvent) {
            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("ZEMPLOYEES_SRV").getPath();
            this.getView().getModel("ZEMPLOYEES_SRV").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {

                }
            });
            oEvent.getSource().getBinding("items").refresh();

        };
        function downloadFile(oEvent) {
            const sPath = oEvent.getSource().getBindingContext("ZEMPLOYEES_SRV").getPath();
            window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value/");
        }


        var Main = Controller.extend("PF.rrhh.controller.EmployeeDetails", {});
        Main.prototype.onInit = onInit;
        Main.prototype.onDeleteEmployee = onDeleteEmployee;
        Main.prototype.onRiseEmployee = onRiseEmployee;
        Main.prototype.onCloseRiseDialog = onCloseRiseDialog;
        Main.prototype.addRise = addRise;
        Main.prototype.downloadFile = downloadFile;
        Main.prototype.onFileChange = onFileChange;
        Main.prototype.onFileBeforeUpload=onFileBeforeUpload;        
        Main.prototype.onFileUploadComplete = onFileUploadComplete;
        Main.prototype.downloadFile = downloadFile;
        Main.prototype.onAfterRendering = onAfterRendering;
    });