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

            this._splitAppEmployee = this.byId("splitAppEmployee");
            const aFilter = [];
//Establece filtro inicial para que solo se lean datos correspondientes a el SAPID que esta configurado en el Component.js
            aFilter.push(new Filter("SapId", "EQ", this.getOwnerComponent().SapId));
            this._oView = this.getView();
            this._oView.attachAfterRendering(function () {
                var oBinding = this.byId("list").getBinding("items");
                oBinding.filter(aFilter);
            })
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



        function onReadODataIncidence(employeeID) {
            this.getView().getModel("odataModel").read("/Users", {
                filters: [

                    new sap.ui.model.Filter("EmployeeId", "EQ", employeeID.toString()),
                    new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId)
                ],
                success: function (data) {
                    var dataModel = this._detailEmployeeView.getModel("odataModel");
                    dataModel.setData(data.results);

                }.bind(this),
                error: function (e) {

                }
            });
        }

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

        };
        
        function showDetails(oEvent) {

            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext("odataModel");
            var sPath = oContext.getPath();
            this._bus.publish("flexible", "showDetails", sPath);
        };

        var Main = Controller.extend("PF.rrhh.controller.MasterEmployee", {});
        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onReadODataIncidence = onReadODataIncidence;
        Main.prototype.showDetails = showDetails;

        Main.prototype.onBack = onBack;
    });