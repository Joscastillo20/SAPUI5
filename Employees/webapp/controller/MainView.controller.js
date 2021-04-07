// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     * 
     */

    function (Controller, JSONModel, Filter, FilterOperator ) {
        "use strict";

        function onInit() {

            var oJSONModel = new JSONModel();
            var oView = this.getView();
            var i18nBundle = oView.getModel("i18n").getResourceBundle();

            // var oJSON = {
            //     employeeId: "123456",
            //     countryKey :"UK",
            //     listCountry:[
            //         {
            //             key : "US",
            //             text: i18nBundle.getText("CountryUS")
            //         },
            //         {
            //             key : "UK",
            //             text: i18nBundle.getText("CountryUK")
            //         },
            //         {
            //             key : "ES",
            //             text: i18nBundle.getText("CountryES")
            //         }
            //     ]
            // };


           // oJSONModel.setData(oJSON);
           oJSONModel.loadData("./localService/mockdata/Employees.json", false); 
           oJSONModel.attachRequestCompleted( function(oEventModel){
            //  console.log(JSON.stringify(oJSONModel.getData())); 

           });
           oView.setModel(oJSONModel);
        };

        function onFilter(){

            var oJSON = this.getView().getModel().getData();
            
            var filters = [];
            
            if (oJSON.EmployeeId !== ""){

                filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSON.EmployeeId));
            }
            
            if (oJSON.CountryKey !== ""){

                filters.push(new Filter("Country", FilterOperator.EQ, oJSON.CountryKey));
            }

            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);


        };

        function onClearFilter(){

            var oModel = this.getView().getModel();
            oModel.setProperty("/EmployeeId","");
            oModel.setProperty("/CountryKey","");
            this.onFilter();

        };

        function showCodePostal(oEvent){
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext();
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show(objectContext.PostalCode);
        }

        var Main = Controller.extend("logaligroup.Employees.controller.MainView", {});

            Main.prototype.onValidate = function () {

                var inputEmployee = this.byId("inputEmployee");
                var valueEmployee = inputEmployee.getValue();

                if ( valueEmployee.length === 6 ) {
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
            
            return Main;
        });
