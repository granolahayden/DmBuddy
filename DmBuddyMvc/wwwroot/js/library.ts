namespace dmb.library
{
    let TABLE: HTMLTableSectionElement

    const NAMEINDEX: number = 0;
    const ACINDEX: number = 1;
    const HPINDEX: number = 2;
    const INITIATIVESINDEX: number = 3;
    const ADDINDEX: number = 4;
    const DELETEINDEX: number = 5;


    export function init() {
        TABLE = document.getElementById("creatureLibraryTable").getElementsByTagName('tbody')[0] as HTMLTableSectionElement;
    }

    export function InsertTemplateToTable(template: dmb.encounter.CreatureTemplate, index: number): void {
        let row = TABLE.insertRow(index);
        row.className = "align-middle";
        row.insertCell(NAMEINDEX).innerHTML = template.GetName();
        row.insertCell(ACINDEX).innerHTML = template.AC.toString();
        row.insertCell(HPINDEX).innerHTML = template.MaxHP.toString();
        row.insertCell(INITIATIVESINDEX).innerHTML = "<div class='p-2'> <input style='width:80px' id='" + template.GetName() + "_InitiativeInput' type = 'text' /></div>";
        row.insertCell(ADDINDEX).innerHTML = "<button class='btn btn-primary btn-sm' onclick='dmb.library.AddCreatureFromLibrary(\"" + template.GetName() + "\")'>+</button>";
        row.insertCell(DELETEINDEX).innerHTML = "<button class='btn btn-outline-danger btn-sm' onclick='dmb.library.DeleteTemplateByName(\"" + template.GetName() + "\")'><i class='bi bi-trash'></i></button>";
    }

    export function AddCreatureFromLibrary(name: string): void {
        let initiatives = $("[id='" + name + "_InitiativeInput']").first().val() as string;
        let initiativesarray = initiatives.match(dmb.encounter.INITIATIVEREGEX);
        if (initiativesarray.length < 1)
            return;

        let templateindex = dmb.encounter.GetCreatureTemplates().findIndex(t => t.GetName() == name);
        dmb.encounter.AddCreaturesFromTemplateIndex(templateindex, initiativesarray);
        ClearInitiativeInput(name);
        dmb.save.SaveCreatureData();
    }

    export function DeleteTemplateByName(name: string): void {
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

    function ClearInitiativeInput(name: string): void {
        $("[id='" + name + "_InitiativeInput']").first().val('');
    }
}
$(dmb.library.init);