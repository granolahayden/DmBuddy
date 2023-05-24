namespace dmb.library
{
    let TABLE: HTMLTableElement

    const NAMEINDEX: number = 0;
    const ACINDEX: number = 1;
    const HPINDEX: number = 2;
    const INITIATIVESINDEX: number = 3;
    const ADDINDEX: number = 4;
    const DELETEINDEX: number = 5;


    export function init() {
        TABLE = document.getElementById("creatureLibraryTable") as HTMLTableElement;
    }

    export function InsertTemplateToTable(template: dmb.encounter.CreatureTemplate, index: number): void {
        let row = TABLE.getElementsByTagName('tbody')[0].insertRow(index);
        row.className = "align-middle";
        row.insertCell(NAMEINDEX).innerHTML = template.GetName();
        row.insertCell(ACINDEX).innerHTML = template.AC.toString();
        row.insertCell(HPINDEX).innerHTML = template.MaxHP.toString();
        row.insertCell(INITIATIVESINDEX).innerHTML = "<div class='p-2'> <input style='width:80px' id='"+ index +"_InitiativeInput' type = 'text' /></div>";
        row.insertCell(ADDINDEX).innerHTML = "<button class='btn btn-primary btn-sm' onclick='dmb.library.AddCreatureFromLibrary(" + index + ")'>+</button>";
        row.insertCell(DELETEINDEX).innerHTML = "<button class='btn btn-outline-danger btn-sm' onclick='dmb.library.DeleteTemplateByIndex(" + index + ")'><i class='bi bi-trash'></i></button>";
    }

    export function AddCreatureFromLibrary(index: number): void {
        let initiatives = $("#" + index + "_InitiativeInput").val() as string;
        let initiativesarray = initiatives.match(dmb.encounter.INITIATIVEREGEX);
        if (initiativesarray.length < 1)
            return;

        dmb.encounter.AddCreaturesFromTemplateIndex(index, initiativesarray);
        ClearInitiativeInput(index);
        dmb.save.SaveCreatureData();
    }

    function DeleteTemplateByIndex(index: number): void {
        //also delete all creatures? yeah
    }

    function ClearInitiativeInput(index: number): void {    
        $("#" + index + "_InitiativeInput").val('');
    }
}
$(dmb.library.init);