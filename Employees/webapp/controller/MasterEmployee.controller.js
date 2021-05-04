// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Table"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     * @param {typeof sap.m.ColumnListItem} ColumnListItem
     * @param {typeof sap.m.Label} Label
     * @param {typeof sap.m.Table} mTable
     * 
     */
    function (Controller, JSONModel, Filter, FilterOperator, ColumnListItem, Label, mTable) {
       "use strict";
        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onFilter() {

            var oJSONCountries = this.getView().getModel("jsonCountries").getData();

            var filters = [];

            if (oJSONCountries.EmployeeId !== "") {

                filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
            }

            if (oJSONCountries.CountryKey !== "") {

                filters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
            }

            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);


        };

        function onClearFilter() {

            var oModel = this.getView().getModel("jsonCountries");
            oModel.setProperty("/EmployeeId", "");
            oModel.setProperty("/CountryKey", "");
            this.onFilter();

        };

        function showCodePostal(oEvent) {
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("oDataNorthwind");
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show(objectContext.PostalCode);
        };

        function onShowCity() {
            var oModel = this.getView().getModel("jsonModelConfig");
            oModel.setProperty("/visibleCity", true);
            oModel.setProperty("/visibleBtnShowCity", false);
            oModel.setProperty("/visibleBtnHideCity", true);
        };

        function onHideCity() {
            var oModel = this.getView().getModel("jsonModelConfig");
            oModel.setProperty("/visibleCity", false);
            oModel.setProperty("/visibleBtnShowCity", true);
            oModel.setProperty("/visibleBtnHideCity", false);
        };

        function showOrders(oEvent) {
            //get selected Controller

            var iconPressed = oEvent.getSource();

            //Context from the model 
            var oContext = iconPressed.getBindingContext("oDataNorthwind");

            if (!this._oDialogOrders) {
                this._oDialogOrders = sap.ui.xmlfragment("logaligroup.Employees.fragment.DialogOrders", this);
                this.getView().addDependent(this._oDialogOrders);

            };
            //Dialog Binding to the context to have acccess to the data of selected item
            this._oDialogOrders.bindElement("oDataNorthwind>" + oContext.getPath());

            this._oDialogOrders.open();

        };


        function onCloseOrders(){
                this._oDialogOrders.close();

        };


        function showEmployee(oEvent){
            var path = oEvent.getSource().getBindingContext("oDataNorthwind").getPath();
            this._bus.publish("flexible","showEmployee",path);

        };

        var Main = Controller.extend("logaligroup.Employees.controller.MasterEmployee", {});

        Main.prototype.onValidate = function () {

            var inputEmployee = this.byId("inputEmployee");
            var valueEmployee = inputEmployee.getValue();

            if (valueEmployee.length === 6) {
                //  inputEmployee.setDescription("OK");
                this.byId("LabelCountry").setVisible(true);
                this.byId("slCountry").setVisible(true);
            } else {
                //  inputEmployee.setDescription("Not OK");
                this.byId("LabelCountry").setVisible(false);
                this.byId("slCountry").setVisible(false);
            }
        };

        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.showCodePostal = showCodePostal;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.showOrders = showOrders;
        Main.prototype.onCloseOrders = onCloseOrders;       
        Main.prototype.showEmployee = showEmployee; 
        return Main;
    });
