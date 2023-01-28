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
        function init() {
            TABLE = document.getElementById("creatureLibraryTable");
        }
        library.init = init;
        function InsertTemplateToTable(template, index) {
            let row = TABLE.getElementsByTagName('tbody')[0].insertRow(index);
            row.className = "align-middle";
            row.insertCell(NAMEINDEX).innerHTML = template.GetName();
            row.insertCell(ACINDEX).innerHTML = template.AC.toString();
            row.insertCell(HPINDEX).innerHTML = template.MaxHP.toString();
            row.insertCell(INITIATIVESINDEX).innerHTML = "<div class='text-center p-2' > <input id='" + index + "_InitiativeInput' type = 'text' /></div>";
            row.insertCell(ADDINDEX).innerHTML = "<button class='btn btn-primary' onclick='dmb.library.AddCreatureFromLibrary(" + index + ")'>+</button>";
        }
        library.InsertTemplateToTable = InsertTemplateToTable;
        function AddCreatureFromLibrary(index) {
            let initiatives = $("#" + index + "_InitiativeInput").val();
            let initiativesarray = initiatives.match(dmb.encounter.INITIATIVEREGEX);
            if (initiativesarray.length < 1)
                return;
            dmb.encounter.AddCreaturesFromTemplateIndex(index, initiativesarray);
            ClearInitiativeInput(index);
        }
        library.AddCreatureFromLibrary = AddCreatureFromLibrary;
        function ClearInitiativeInput(index) {
            $("#" + index + "_InitiativeInput").val('');
        }
    })(library = dmb.library || (dmb.library = {}));
})(dmb || (dmb = {}));
$(document).ready(function () {
    dmb.library.init();
});
//# sourceMappingURL=library.js.map