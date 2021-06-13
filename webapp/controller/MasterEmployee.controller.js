sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter} Filter
	 */
    function (Controller, Filter, FilterOperator, History) {
        "use strict";

        function onInit() {
            
            this._bus = sap.ui.getCore().getEventBus();

            const aFilter = [];
//Establece filtro inicial para que solo se lean datos correspondientes a el SAPID que esta configurado en el Component.js
            aFilter.push(new Filter("SapId", "EQ", this.getOwnerComponent().SapId));
            this._oView = this.getView();
            this._oView.attachAfterRendering(function () {
                var oBinding = this.byId("list").getBinding("items");
                oBinding.filter(aFilter);
            })
        };
//Regresar a Menu Principal
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

//Filtra listado de empleados según datos completado de nombre por la interfaz
//mostrando siempre los relacionados con el SAPID
        function onFilter(oEvent) {
            const aFilter = [];
            const sQuery = oEvent.getParameter("query");

            if (sQuery) {
                aFilter.push(new Filter("FirstName", "EQ", sQuery));
            };
            //Establece filtro inicial para que solo se lean datos correspondientes a el SAPID que esta configurado en el Component.js
            aFilter.push(new Filter("SapId", "EQ", this.getOwnerComponent().SapId));

            const oList = this.getView().byId("list");
            const oBinding = oList.getBinding("items");

            oBinding.filter(aFilter);
            this.showDetails(oEvent);
        };
    //este evento lo dispara la Vista MasterEmployee que es llamada de la vista principal EmployeeView que es la que tiene los datos  
    //es necesario  en el onInit completar this._bus = sap.ui.getCore().getEventBus(); 
    //The SAPUI5 EventBus lets you share methods across controllers.
        function showDetails(oEvent) {
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("odataModel");
            if (oContext !== undefined)
            {
                 var sPath = oContext.getPath();
                 this._bus.publish("flexible", "showDetails", sPath);
            }
            else
             this._bus.publish("flexible", "showDetails", sPath);

        };

        var Main = Controller.extend("PF.rrhh.controller.MasterEmployee", {});
        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.showDetails = showDetails;
        Main.prototype.onBack = onBack;
    });