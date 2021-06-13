sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller) {
        "use strict";

        function onInit() {
            //llamada compartida desde el controller de la vista EmployeeDetailsView
            this._bus = sap.ui.getCore().getEventBus();
      
        };

        function onAfterRendering() {
            // Error en el framework : Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL,
            // pero no funciona en la version 1.78. Por tanto, una solución  encontrada es eliminando la propiedad id del componente por jquery
            var genericTileFirmarPedido = this.byId("link");
            //Id del dom
            var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
            //Se vacia el id
            jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
        };

        //Al pulsar sobre el tile “Crear empleado”, se debe navegar a una nueva vista EmployeeCreate.view.xml
        //donde el usuario pueda crear un nuevo empleado
        //debe de estar definido en el manifest en el route y targets
        function navToCreateEmployee(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("EmployeeCreate", {}, false);
        };

        //Al presionar sobre el Tile "Ver Empleado" se debe de navegar a una nueva vista.
        //debe de estar definido en el manifest en el route y targets
        function navToViewEmployee(oEvent) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("EmployeeView", {}, false);
        };

        var Main = Controller.extend("PF.rrhh.controller.menu", {});
        Main.prototype.onInit = onInit;
        Main.prototype.onAfterRendering = onAfterRendering;
        Main.prototype.navToCreateEmployee = navToCreateEmployee;
        Main.prototype.navToViewEmployee = navToViewEmployee;
    });