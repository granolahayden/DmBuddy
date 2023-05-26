var dmb;
(function (dmb) {
    var library;
    (function (library) {
        let TABLE;
        const NAMEINDEX = 0;
        const ACINDEX = 1;
        const HPINDEX = 2;
        const INITIATIVESINDEX = 3;
        const ADDINDEX = 4;
        const DELETEINDEX = 5;
        function init() {
            TABLE = document.getElementById("creatureLibraryTable").getElementsByTagName('tbody')[0];
        }
        library.init = init;
        function InsertTemplateToTable(template, index) {
            let row = TABLE.insertRow(index);
            row.className = "align-middle";
            row.insertCell(NAMEINDEX).innerHTML = template.GetName();
            row.insertCell(ACINDEX).innerHTML = template.AC.toString();
            row.insertCell(HPINDEX).innerHTML = template.MaxHP.toString();
            row.insertCell(INITIATIVESINDEX).innerHTML = "<div class='p-2'> <input style='width:80px' id='" + template.GetName() + "_InitiativeInput' type = 'text' /></div>";
            row.insertCell(ADDINDEX).innerHTML = "<button class='btn btn-primary btn-sm' onclick='dmb.library.AddCreatureFromLibrary(\"" + template.GetName() + "\")'>+</button>";
            row.insertCell(DELETEINDEX).innerHTML = "<button class='btn btn-outline-danger btn-sm' onclick='dmb.library.DeleteTemplateByName(\"" + template.GetName() + "\")'><i class='bi bi-trash'></i></button>";
        }
        library.InsertTemplateToTable = InsertTemplateToTable;
        function AddCreatureFromLibrary(name) {
            let initiatives = $("[id='" + name + "_InitiativeInput']").first().val();
            let initiativesarray = initiatives.match(dmb.encounter.INITIATIVEREGEX);
            if (initiativesarray.length < 1)
                return;
            let templateindex = dmb.encounter.GetCreatureTemplates().findIndex(t => t.GetName() == name);
            dmb.encounter.AddCreaturesFromTemplateIndex(templateindex, initiativesarray);
            ClearInitiativeInput(name);
            dmb.save.SaveCreatureData();
        }
        library.AddCreatureFromLibrary = AddCreatureFromLibrary;
        function DeleteTemplateByName(name) {
            dmb.save.LockSave();
            try {
                const deleteindex = dmb.encounter.GetCreatureTemplates().findIndex(t => t.GetName() == name);
                TABLE.deleteRow(deleteindex);
                let deletecreatures = dmb.encounter.GetCreatures().filter(c => c.TemplateName == dmb.encounter.GetCreatureTemplate(deleteindex).GetName());
                for (let i = 0; i < deletecreatures.length; i++) {
                    dmb.encounter.RemoveFromInitiative(deletecreatures[i].Id);
                }
                dmb.encounter.GetCreatureTemplates().splice(deleteindex, 1);
            }
            catch (error) { }
            dmb.save.UnlockSave();
            dmb.save.SaveCreatureTemplateData();
            dmb.save.SaveCreatureData();
        }
        library.DeleteTemplateByName = DeleteTemplateByName;
        function ClearInitiativeInput(name) {
            $("[id='" + name + "_InitiativeInput']").first().val('');
        }
    })(library = dmb.library || (dmb.library = {}));
})(dmb || (dmb = {}));
$(dmb.library.init);
//# sourceMappingURL=library.js.map