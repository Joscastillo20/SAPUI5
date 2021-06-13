sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, MessageBox) {
        "use strict";

        function onBeforeRendering() {
            this._wizard = this.byId("wizard");
            //Se crea el modelo principal que contendrá todos los datos
            this._model = new sap.ui.model.json.JSONModel({});
            this.getView().setModel(this._model);
            //Se reseta los pasos por si ya se ha ejecutado la aplicacion antes
            var oFirstStep = this._wizard.getSteps()[0];
            this._wizard.discardProgress(oFirstStep);
            // scroll to top
            this._wizard.goToStep(oFirstStep);
            // Inhabilita boton de siguiente paso en primera pantalla
            oFirstStep.setValidated(false);
            //
        };

        function onInit() {

        };

        //Función al pulsar sobre el tipo de empleado
        //Se activa el paso 2
        function toStep2(oEvent) {
            //Step 1
            var dataEmployeeStep = this.byId("EmployeeDataStep");
            //Step 2
            var typeEmployeeStep = this.byId("EmployeeTypeStep");


            //Se obtiene el tipo seleccionado con el "CustomData"
            var button = oEvent.getSource();
            var typeEmployee = button.getText();//("typeEmployee");

            if (typeEmployee !== undefined)
                this._model.setProperty("/_type", typeEmployee);
            else
                this._model.setProperty("/_type", '');

            //Se obtiene el tipo seleccionado con el "CustomData"
            var button = oEvent.getSource();

            //Dependiendo del tipo, el salario bruto por defecto es:
            // Interno: 24000
            // autonomo : 400
            // Gerente : 70000
            var Salary, Type, type;
            switch (typeEmployee) {
                case "Interno":
                    Salary = 24000;
                    Type = "Interno";
                    type = "0";
                    break;
                case "Autonomo":
                    Salary = 400;
                    Type = "Autonomo";
                    type = "1";
                    break;
                case "Gerente":
                    Salary = 70000;
                    Type = "Gerente";
                    type = "2";
                    break;
                default:
                    break;
            }

            //Al pulsar sobre el tipo, se sobreescribe el modelo registrando el tipo  y el valor del salario por defecto
            this._model.setData({
                _Salary: Salary,
                _Type: Type,
                Type: type
            });

            //Se comprueba si se está en el paso 1, ya que se debe usar la función "nextStep" para activar el paso 2.
            if (this._wizard.getCurrentStep() === typeEmployeeStep.getId()) {
                this._wizard.nextStep();
            } else {
                // En caso de que ya se encuentre activo el paso 2, se navega directamente a este paso 
                this._wizard.goToStep(dataEmployeeStep);
            }
        };

        //Validaciones de Paso 2
        function validateEmployeeStep(oEvent, callback) {
            var object = this._model.getData();
            var isValid = true;


            if (this._model.getProperty("/_type") == "Autonomo") {
                this._model.setProperty("/_visibleDni", false);
                this._model.setProperty("/_visibleCfi", true);
            }
            else {
                this._model.setProperty("/_visibleDni", true);
                this._model.setProperty("/_visibleCfi", false);
            }

            //Nombre
            //var name = this.byId("EmployeeName").getValue();
            var name = object.FirstName;
            if (name !== 'undefined') {
                if (!name) {//Nombre en Blanco 
                    this._model.setProperty("/_EmployeeName", "Error");//valueState  en campo input
                    isValid = false;
                } else {
                    this._model.setProperty("/_EmployeeName", "None");//valueState  en campo input
                }

            }
            else {
                isValid = false;
            }

            //Apellido
            name = object.LastName;
            if (name !== 'undefined') {
                if (!name) {//Apellido en Blanco 
                    this._model.setProperty("/_EmployeeLastName", "Error");//valueState  en campo input
                    isValid = false;
                } else {
                    this._model.setProperty("/_EmployeeLastName", "None");//valueState  en campo input
                }

            }
            else {
                isValid = false;
            }

            //DNI
            name = object.Dni;
            if (object._Type !== "Autonomo") {
                if (name !== 'undefined') {
                    if (!name) {//dni 
                        if (this._model.getProperty("/_visibleDni")) {
                            this._model.setProperty("/_dni", "Error");//valueState  en campo input
                            isValid = false;
                        }
                    } else {

                        this.validateDNI(oEvent);
                        var msg = this._model.getProperty("/_dni");
                        isValid = true;
                        if (msg === 'Error') {
                            isValid = false;

                        }
                    }

                }
                else {
                    isValid = false;
                }

            }

            //CFI
            name = object._Dni;
            if (object._Type === "Autonomo") {
                if (name !== 'undefined') {
                    if (!name) {//cfi
                        this._model.setProperty("/_cfi", "Error");//valueState  en campo input
                        isValid = false;
                    } else {
                        this._model.setProperty("/_cfi", "None");//valueState  en campo input
                        isValid = true;
                    }

                }
                else {
                    isValid = false;
                }

            }
            //Fecha 
            name = object.CreationDate;
            if (name !== 'undefined') {
                if (!name) {//fecha
                    this._model.setProperty("/_CreationDateState", "Error");//valueState  en campo input
                    isValid = false;
                } else {
                    this._model.setProperty("/_CreationDateState", "None");//valueState  en campo input
                }

            }
            else {
                isValid = false;
            }

            if (!isValid) {
                this._wizard.invalidateStep(this.byId("EmployeeDataStep"));
                //   MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("fillData"));
            } else {
                this._wizard.validateStep(this.byId("EmployeeDataStep"));
                // this._wizard.nextStep();
            }
            //Si hay callback se devuelve el valor isValid
            if (callback) {
                callback(isValid);
            }
        };
        //Función para validar el dni
        function validateDNI(oEvent) {
            //Se comprueba si es dni o cif. En caso de dni, se comprueba su valor. Para ello se comprueba que el tipo no sea "autonomo"
            if (this._model.getProperty("_type") !== "Autonomo") {
                var dni = this.byId("dni").getValue();//oEvent.getParameter("value");
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {

                        this._model.setProperty("/_dni", "Error");
                    } else {
                        this._model.setProperty("/_dni", "None");
                    }
                } else {

                    this._model.setProperty("/_dni", "Error");
                }

            }
        };
        //Retornar al menú Principal 
        //
        function onCloseEmployeeCreate() {
            //es necesario agregar dependencia de mensaje  "sap/m/MessageBox"
            MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmRetornoMenu"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        // @ts-ignore
                        oRouter.navTo("menu", {}, true);
                    }
                }.bind(this)
            }
            );

        };

        function onBack() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                // @ts-ignore
                oRouter.navTo("menu", true);
            }
        };
        //La clave del slug se construye con el SapId declarado en el component  
        function onFileBeforeUpload(oEvent) {

            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.newUser + ";" + oEvent.getParameter("fileName")

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



        //Función al dar al botón verificar
        function wizardCompletedHandler(oEvent) {
            //Se comprueba que no haya error
            this.validateEmployeeStep(oEvent, function (isValid) {
                if (isValid) {
                    //Se navega a la página review
                    var wizardNavContainer = this.byId("wizardNavContainer");
                    wizardNavContainer.to(this.byId("ReviewPage"));
                    //Se obtiene los archivos subidos
                    var uploadCollection = this.byId("UploadCollection");
                    var files = uploadCollection.getItems();
                    var numFiles = uploadCollection.getItems().length;
                    this._model.setProperty("/_numFiles", numFiles);
                    if (numFiles > 0) {
                        var arrayFiles = [];
                        for (var i in files) {
                            arrayFiles.push({ DocName: files[i].getFileName(), MimeType: files[i].getMimeType() });
                        }
                        this._model.setProperty("/_files", arrayFiles);
                    } else {
                        this._model.setProperty("/_files", []);
                    }
                } else {
                    this._wizard.goToStep(this.byId("dataEmployeeStep"));
                }
            }.bind(this));
        }

        //Función al cancelar la creación
        function onCancelEmployeeCreate() {
            //Se muestra un mensaje de confirmación
            sap.m.MessageBox.confirm(this.oView.getModel("i18n").getResourceBundle().getText("cancelEmployeeCreate"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //Regresamos al menú principal
                        //Se obtiene el conjuntos de routers del programa
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        //Se navega hacia el router "menu"
                        var wizardNavContainer = this.byId("wizardNavContainer");
                        wizardNavContainer.to(this.byId("wizardContentPage"));
                        oRouter.navTo("menu", true);
                    }
                }.bind(this)
            });

        }

        //Función para guardar el nuevo empleado
        function onSaveEmployeeCreate() {
            var json = this.getView().getModel().getData();
            var body = {};


            //Se obtienen aquellos campos que no empicen por "_", ya que son los que vamos a enviar
            for (var i in json) {
                if (i.indexOf("_") !== 0) {
                    body[i] = json[i];
                }
            }
            body.SapId = this.getOwnerComponent().SapId;
            body.EmployeeId = "001";
            //  body.EmployeeId =body.EmployeeId .toString();
            body.UserToSalary = [{
                Ammount: parseFloat(json._Salary).toString(),
                Comments: json.Comments,
                Waers: "EUR"
            }];

            this.getView().setBusy(true);
            this.getView().getModel("odataModel").create("/Users", body, {
                success: function (data) {
                    this.getView().setBusy(false);
                    //Se almacena el nuevo usuario
                    this.newUser = data.EmployeeId;
                    sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this.newUser, {
                        onClose: function () {
                            //Se vuelve al wizard, para que al vovler a entrar a la aplicacion aparezca ahi
                            var wizardNavContainer = this.byId("wizardNavContainer");
                            wizardNavContainer.back();
                            //Regresamos al menú principal
                            //Se obtiene el conjuntos de routers del programa
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            //Se navega hacia el router "menu"
                            oRouter.navTo("menu", {}, true);
                        }.bind(this)
                    });
                    //Se llama a la función "upload" del uploadCollection
                    this.onStartUpload();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageBox.error(this.oView.getModel("i18n").getResourceBundle().getText("NotSaved"));
                }.bind(this),
            });
        }

        function onStartUpload(ioNum) {
            var that = this;
            var oUploadCollection = that.byId("UploadCollection");
            oUploadCollection.upload();
        }
        //Función generica para editar un step
        function _editStep(step) {
            var wizardNavContainer = this.byId("wizardNavContainer");
            //Se añade un función al evento afterNavigate, ya que se necesita 
            //que la función se ejecute una vez ya se haya navegado a la vista principal
            var fnAfterNavigate = function () {
                this._wizard.goToStep(this.byId(step));
                //Se quita la función para que no vuelva a ejecutar al volver a nevagar
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();
        }

        //Función al darle al botón editar de la sección "Tipo de empleado"
        function editStepOne() {
            _editStep.bind(this)("EmployeeTypeStep");
        }

        //Función al darle al botón editar de la sección "Datos de empleado"
        function editStepTwo() {
            _editStep.bind(this)("EmployeeDataStep");
        }

        //Función al darle al botón editar de la sección "Información adicional"
        function editStepThree() {
            _editStep.bind(this)("AdittionalStep");
        }

        var Main = Controller.extend("PF.rrhh.controller.EmployeeCreate", {});
        Main.prototype.onBeforeRendering = onBeforeRendering;
        Main.prototype.onInit = onInit;
        Main.prototype.onCloseEmployeeCreate = onCloseEmployeeCreate;
        Main.prototype.onCancelEmployeeCreate = onCancelEmployeeCreate;
        Main.prototype.onSaveEmployeeCreate = onSaveEmployeeCreate;
        Main.prototype.toStep2 = toStep2;
        Main.prototype._editStep = _editStep;
        Main.prototype.editStepOne = editStepOne;
        Main.prototype.editStepTwo = editStepTwo;
        Main.prototype.editStepThree = editStepThree;
        Main.prototype.validateEmployeeStep = validateEmployeeStep;
        Main.prototype.wizardCompletedHandler = wizardCompletedHandler;
        Main.prototype.validateDNI = validateDNI;
        Main.prototype.onFileChange = onFileChange;
        Main.prototype.onFileBeforeUpload = onFileBeforeUpload;
        Main.prototype.onFileUploadComplete = onFileUploadComplete;
        Main.prototype.downloadFile = downloadFile;
        Main.prototype.onStartUpload = onStartUpload;

    });
