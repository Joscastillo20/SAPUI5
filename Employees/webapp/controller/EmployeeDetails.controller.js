// @ts-nocheck
sap.ui.define([
    "logaligroup/Employees/controller/Base.controller",
    "logaligroup/Employees/model/formatter",
    "sap/m/MessageBox"
],

    function (Base, formatter, MessageBox) {


        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onCreateIncidence() {

            var tableIncidence = this.getView().byId("tableIncidence");

            var newIncidence = sap.ui.xmlfragment("logaligroup.Employees.fragment.NewIncidence", this);

            var incidenceModel = this.getView().getModel("incidenceModel");

            var odata = incidenceModel.getData();
            var index = odata.length;
            odata.push({ index: index + 1, _ValidateDate: false, EnabledSave: false });
            incidenceModel.refresh();

            newIncidence.bindElement("incidenceModel>/" + index);
            tableIncidence.addContent(newIncidence);

        };

        function onDeleteIncidence(oEvent) {

            var contextObj = oEvent.getSource().getBindingContext("incidenceModel").getObject();
            MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteIncidence"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        this._bus.publish("incidence", "onDeleteIncidence",
                            {
                                IncidenceId: contextObj.IncidenceId,
                                SapId: contextObj.SapId,
                                EmployeeId: contextObj.EmployeeId
                            });
                    }
                }.bind(this)
            }
            );
        };

        function onSaveIncidence(oEvent) {
            var incidence = oEvent.getSource().getParent().getParent();
            var incidenceRow = incidence.getBindingContext("incidenceModel");
            this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow.sPath.replace('/', '') });

        };
        function updateIncidenceCreationDate(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObj = context.getObject();
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (!oEvent.getSource().isValidValue() || !oEvent.getSource().getValue()) {
                contextObj._ValidateDate = false;
                contextObj.CreationDateState = "Error";
                MessageBox.error(oResourceBundle.getText("errorCreationDataValue"), {
                    title: "Error",
                    onClose: null,
                    styleClass: "",
                    actions: MessageBox.Action.Close,
                    emphasizedAction: null,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            }
            else {
                contextObj._ValidateDate = true;
                contextObj.CreationDateState = "None";
                contextObj.CreationDateX = true;
            };
            if (oEvent.getSource().isValidValue() && contextObj.Reason) {
                contextObj.EnabledSave = true;
            }
            else {
                contextObj.EnabledSave = false;
            }
            context.getModel().refresh();
        };
        function updateIncidenceReason(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObj = context.getObject();


            if (!oEvent.getSource().getValue()) {
                contextObj.ReasonState = "Error";
            }
            else {
                contextObj.ReasonState = "None";
                contextObj.ReasonX = true;
            };

            if (oEvent.getSource().getValue() && contextObj._ValidateDate) {
                contextObj.EnabledSave = true;
            }
            else {
                contextObj.EnabledSave = false;
            }
            context.getModel().refresh();

        };
        function updateIncidenceType(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObj = context.getObject();
            contextObj.TypeX = true;

            if (contextObj.Reason && contextObj._ValidateDate) {
                contextObj.EnabledSave = true;
            }
            else {
                contextObj.EnabledSave = false;
            }
            context.getModel().refresh();
        };
        

        var employeedDetails = Base.extend("logaligroup.Employees.controller.EmployeeDetails", {});

        employeedDetails.prototype.onInit = onInit;
        employeedDetails.prototype.onCreateIncidence = onCreateIncidence;
        employeedDetails.prototype.onDeleteIncidence = onDeleteIncidence;
        employeedDetails.prototype.onSaveIncidence = onSaveIncidence;
        employeedDetails.prototype.Formatter = formatter;
        employeedDetails.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
        employeedDetails.prototype.updateIncidenceReason = updateIncidenceReason;
        employeedDetails.prototype.updateIncidenceType = updateIncidenceType;

        return employeedDetails;
    });