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
//Abrir vista como ventana         
        function navToCreate(oEvent) {
            //get selected Controller

            var iconPressed = oEvent.getSource();

            if (!this._oDialogOrders) {
                this._oDialogOrders = sap.ui.xmlfragment("PF.rrhh.fragment.NewEmployee", this);
                this.getView().addDependent(this._oDialogOrders);

            };
            this._oDialogOrders.open();
         
        };
//Navegar entre vistas 
        function navToCreateEmployee(oEvent) {

       // var orderID = oEvent.getSource().getBindingContext("oDataNorthwind").getObject().OrderID;

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        oRouter.navTo("EmployeeCreate", true);
    };       
//Cerrar vista Ventana    
        function onCloseOrders() {
            this._oDialogOrders.close();

        };

        var Main = Controller.extend("PF.rrhh.controller.App", {});
    //    Main.prototype.onInit = onInit;
    //    Main.prototype.navToCreateEmployee = navToCreateEmployee;
    //    Main.prototype.onCloseOrders = onCloseOrders;

    });
