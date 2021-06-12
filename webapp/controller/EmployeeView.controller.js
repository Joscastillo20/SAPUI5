sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
  
     function (Controller) {
        "use strict";
        function onBeforeRendering() {
            this._detailEmployeeView = this.getView().byId("EmployeeDetailsView");
        };
  
        function onInit() {
            //llamada compartida desde el controller de la vista EmployeeDetailsView con MasterEmployee
            this._bus = sap.ui.getCore().getEventBus();
            this._bus.subscribe("flexible", "showDetails", this.showDetails, this);
        };

        function showDetails(category, nameEvent, path) {
            //Pasa valores de selección de listado a vista EmployeeDetailsView 
            var detailsView = this.getView().byId("EmployeeDetailsView");
            detailsView.bindElement("odataModel>" + path);
        };

        var Main = Controller.extend("PF.rrhh.controller.EmployeeView", {});
        Main.prototype.onInit = onInit;
        Main.prototype.showDetails = showDetails;
        Main.prototype.onBeforeRendering = onBeforeRendering;

    });