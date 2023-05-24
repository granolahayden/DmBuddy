namespace dmb.encounter
{
    export class CreatureTemplate {
        Name: string;
        NameCount: number;
        AC: number;
        MaxHP: number;
        DefaultNotes: string;
        PictureData: string;

        GetName(): string {
            if (this.NameCount > 1)
                return this.Name + " (" + this.NameCount + ")";
            else
                return this.Name;
        }
    }

    export class Creature {
        constructor(template: CreatureTemplate, templateIndex: number) {
            this.Id = id++;
            this.CurrentHP = template.MaxHP;
            this.Notes = template.DefaultNotes;
            this.CreatureIndex = Number(templateIndex);
        }

        Id: number;
        CreatureIndex: number;
        NameCount: number;
        CurrentHP: number;
        Initiative: number;
        Notes: string;

        GetHP(): string {
            return this.CurrentHP.toString() + "/" + this.GetCreatureTemplate().MaxHP.toString();
        }

        GetAC(): number {
            return this.GetCreatureTemplate().AC;
        }

        GetCreatureTemplate(): CreatureTemplate {
            return creatureTemplates[this.CreatureIndex];
        }

        GetName(): string {
            if (this.NameCount > 1)
                return this.GetCreatureTemplate().GetName() + " - " + this.NameCount;
            else
                return this.GetCreatureTemplate().GetName();
        }
    }

    const INITIATIVEINDEX: number = 0;
    const NAMEINDEX: number = 1;
    const NOTESINDEX: number = 2;
    const ACINDEX: number = 3;
    const HPINDEX: number = 4;
    const DAMAGEINPUTINDEX: number = 5;
    const IDINDEX: number = 6;
    const DELETEINDEX: number = 7;

    export const INITIATIVEREGEX = /\d+\.?\d?/g;

    const HPCHANGEDISPLAYID = "DamageOrHealAmountFromDisplay";
    const SELECTEDROWCLASS = "bg-warning";

    declare let creatures: Creature[];
    declare let creatureTemplates: CreatureTemplate[];
    declare let id: number;

    declare let nameInput: JQuery<HTMLElement>;
    declare let acInput: JQuery<HTMLElement>;
    declare let hpInput: JQuery<HTMLElement>;
    declare let initiativeInput: JQuery<HTMLElement>;
    declare let notesInput: JQuery<HTMLElement>;

    export function Init(): void {
        creatures = [];
        creatureTemplates = [];
        id = 0;

        nameInput = $("#creatureNameInput");
        acInput = $("#creatureACInput");
        hpInput = $("#creatureHPInput");
        initiativeInput = $("#creatureInitiativeInput");
        notesInput = $("#creatureNotesInput");

        $("#addCreatureModal").on('show.bs.modal', function () {
            setTimeout(function () {
                nameInput.trigger("focus");
            }, 500);
        });

        $("#creatureInitiativeInput").on("keyup", function (e) {
            if (e.key === "Enter") {
                SmartAddFromForm();
            }
        });

        $("#creatureHPInput").on("keyup", function (e) {
            if (e.key === "Enter") {
                SmartAddFromForm();
            }
        });

        $("#creatureACInput").on("keyup", function (e) {
            if (e.key === "Enter") {
                SmartAddFromForm();
            }
        });

        $("#creatureDisplayNotes").val("");
        $("#DamageOrHealAmountFromDisplay").val("");

        $('#creatureNotesModal').on('show.bs.modal', function (event: JQueryEventObject) {
            var button = $(event.relatedTarget);
            var creatureid = button.data('creatureid');
            let creature = creatures.find(c => c.Id == Number(creatureid));

            if (GetCurrentCreatureId() == creatureid) {
                creature.Notes = $("#creatureDisplayNotes").val() as string;
            }
            document.getElementById("creatureNotesModalLabel").innerHTML = creature.GetName() + " Notes";
            document.getElementById("creatureNotesModalId").innerHTML = creature.Id.toString();

            if (dmb.premiumEncounter.IsPremium) {
                dmb.premiumEncounter.SetNotesModalPicture(creature.GetCreatureTemplate().PictureData);
            }

            $("#creatureNotesModalNotes").val(creature.Notes);
        });
    }

    function SmartAddFromForm() {
        if (initiativeInput.val().toString().trim() != "")
            AddCreaturesAndResetForm();
        else
            AddTemplateToLibraryAndResetForm();
    }

    export function AddCreaturesAndResetForm(): void {
        if (initiativeInput.val().toString().trim() == "")
            return;

        CreateTemplateFromInput();

        let initiatives = initiativeInput.val().toString().match(INITIATIVEREGEX);
        if (initiatives.length < 1)
            return;

        AddCreaturesFromTemplateIndex(creatureTemplates.length - 1, initiatives);
        ClearCreatureForm();
        dmb.save.SaveCreatureData();
    }

    

    function CreateTemplateFromInput(): void {
        let name = nameInput.val() as string;
        let ac = Number(acInput.val());
        let maxhp = Number(hpInput.val());
        let defaultnotes = notesInput.val() as string;
        let namecount = creatureTemplates.filter(ct => ct.Name == name).length + 1;
        let picturedata = dmb.premiumEncounter.IsPremium ? dmb.premiumEncounter.GetPictureValue() : "";

        CreateTemplate(name, ac, maxhp, defaultnotes, namecount, picturedata);
        dmb.save.SaveCreatureTemplateData();
    }

    export function CreateTemplate(name: string, ac: number, maxhp: number, defaultnotes: string, namecount: number, picturedata: string): void {
        let template = new CreatureTemplate();
        template.Name = name;
        template.AC = ac;
        template.MaxHP = maxhp;
        template.DefaultNotes = defaultnotes;
        template.NameCount = namecount;

        if (dmb.premiumEncounter.IsPremium)
            template.PictureData = picturedata;

        dmb.library.InsertTemplateToTable(template, creatureTemplates.length);
        creatureTemplates.push(template);
    }

    

    export function AddCreaturesFromTemplateIndex(index: number, initiatives: string[]): void {
        let template = creatureTemplates[index];
        let nameCount = 0;
        let creaturesWithSameName = creatures.filter(c => c.GetCreatureTemplate().GetName() == template.GetName());
        creaturesWithSameName.forEach(c => { if (Number(nameCount) < Number(c.NameCount)) nameCount = c.NameCount; })

        for (let i = 0; i < initiatives.length; i++) {
            let creature = new Creature(template, index);
            creature.NameCount = ++nameCount;
            creature.Initiative = Number(initiatives[i]);
            AddCreature(creature);
        }
    }

    export function AddCreature(creature: Creature): void {
        var table = document.getElementById("initiativeTable") as HTMLTableElement;
        let insertIndex = GetCreatureInsertIndex(creature);
        creatures.splice(insertIndex, 0, creature);
        InsertCreatureIntoTableAtIndex(creature, table, insertIndex)
    }

    function GetCreatureInsertIndex(creature: Creature): number {
        let i: number;
        for (i = 0; i < creatures.length; i++) {
            if (Number(creature.Initiative > Number(creatures[i].Initiative))){
                break;
            }
        }
        return i;
    }

    function InsertCreatureIntoTableAtIndex(creature: Creature, table: HTMLTableElement, index: number): void {
        let row = table.getElementsByTagName('tbody')[0].insertRow(index);
        row.className = 'align-middle';
        row.id = creature.Id + "_row";
        row.insertCell(INITIATIVEINDEX).innerHTML = creature.Initiative.toString();
        row.insertCell(NAMEINDEX).innerHTML = creature.GetName();
        row.insertCell(NOTESINDEX).innerHTML = "<div class='p-2'><button type='button' class='btn btn-outline-primary' data-bs-toggle='modal' data-bs-target='#creatureNotesModal' data-creatureid='" + creature.Id + "'><i class='bi bi-file-text'></i></button></div>";
        row.insertCell(ACINDEX).innerHTML = creature.GetAC().toString();
        row.insertCell(HPINDEX).innerHTML = creature.GetHP();
        row.insertCell(DAMAGEINPUTINDEX).innerHTML = "<div class='d-flex flex-row'>" +
            "<div class='text-center p-2'><button type='button' class='btn btn-danger' onclick='dmb.encounter.DamageCreatureFromId(" + creature.Id + "); dmb.encounter.ClearDamageOrHealInput(" + creature.Id + ")'>-</button></div>" +
            "<div class='text-center p-2'><input style='width:40px' class='text-center' type='text' id='" + creature.Id + "_DamageOrHealAmountFromTable'/></div>" +
            "<div class='text-center p-2 align-middle'><button type='button' class='btn btn-success' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + "); dmb.encounter.ClearDamageOrHealInput(" + creature.Id + ")'>+</button></div></div>";
        row.insertCell(IDINDEX).outerHTML = "<td style='display:none'>" + creature.Id + "</td>";
        row.insertCell(DELETEINDEX).innerHTML = "<div class='p-2'><button type='button' class='btn btn-danger' id='" + creature.Id + "_delete' " + "onclick='dmb.encounter.RemoveFromInitiative(" + creature.Id + ")'><i class='bi bi-trash'></i></button></div>";
    }

    export function ClearDamageOrHealInput(id: number) {
        $("#" + id + "_DamageOrHealAmountFromTable").val('');
    }

    export function HealCreatureFromId(id: number): void {        
        let amount = Number($("#" + id + "_DamageOrHealAmountFromTable").val());
        ChangeCreatureHPFromIdByAmount(id, amount);;
    }

    function ChangeCreatureHPFromIdByAmount(id: number, amount: number) {
        let creature = creatures.find(c => c.Id == id);
        creature.CurrentHP += Number(amount);

        let creatureIndex = creatures.indexOf(creature);
        document.getElementById("initiativeTable").getElementsByTagName('tbody')[0].rows[creatureIndex].cells[HPINDEX].innerHTML = creature.GetHP();

        if (Number(document.getElementById("creatureDisplayId").innerHTML) == id) {
            document.getElementById("creatureDisplayHP").innerHTML = creature.GetHP();
        }

        dmb.save.SaveCreatureData();
    }

    export function DamageCreatureFromId(id: number): void {
        let amount = Number($("#" + id + "_DamageOrHealAmountFromTable").val()) * -1;
        ChangeCreatureHPFromIdByAmount(id, amount);
    }

    export function RemoveFromInitiative(id: number) {
        let table = document.getElementById("initiativeTable").getElementsByTagName('tbody')[0];
        let deleteIndex = creatures.indexOf(creatures.find(c => c.Id == id));
        table.deleteRow(deleteIndex);
        creatures.splice(deleteIndex, 1);

        if (creatures.length == 0) {
            FillCreatureDisplay("Nothing yet!", "--", "--", "", null, "");
        }
        else if (GetCurrentCreature().CreatureIndex == deleteIndex) {
            if (deleteIndex == creatures.length)
                FillCreatureDisplayFromCreature(creatures[0]);
            else
                FillCreatureDisplayFromCreature(creatures[deleteIndex]);
        }

        dmb.save.SaveCreatureData();
    }

    

    export function ClearCreatureForm(): void {
        nameInput.val("");
        acInput.val("");
        hpInput.val("");
        initiativeInput.val("");
        notesInput.val("");

        if (dmb.premiumEncounter.IsPremium)
            dmb.premiumEncounter.ClearPictureInput();

        nameInput.trigger("focus");
    }

    export function ShowNextCreature(): void {
        if (creatures.length == 0) {
            return;
        }

        let currentcreatureid = GetCurrentCreatureId();
        if (currentcreatureid == null) {
            FillCreatureDisplayFromCreature(creatures[0]);
            return;
        }

        let currentcreature = creatures.find(c => c.Id == currentcreatureid);
        let currentcreatureindex = creatures.indexOf(currentcreature);
        let nextcreatureindex = currentcreatureindex == creatures.length - 1 ? 0 : Number(currentcreatureindex) + 1;
        let nextcreature = creatures[nextcreatureindex];

        SaveCurrentCreatureThenLoadNext(currentcreature, nextcreature);
    }

    function GetCurrentCreatureId(): number {
        return document.getElementById("creatureDisplayId").innerHTML == "" ? null : Number(document.getElementById("creatureDisplayId").innerHTML);
    }

    export function FillCreatureDisplayFromCreature(creature: Creature): void {
        FillCreatureDisplay(creature.GetName(), creature.GetHP(), creature.GetAC().toString(), creature.Notes, creature.Id.toString(), creature.GetCreatureTemplate().PictureData)
        SelectRow(creature.Id);
    }

    function FillCreatureDisplay(name: string, hp: string, ac: string, notes: string, id: string, picturedata: string) {
        document.getElementById("creatureDisplayName").innerHTML = name;
        document.getElementById("creatureDisplayHP").innerHTML = hp;
        document.getElementById("creatureDisplayAC").innerHTML = ac;
        $("#creatureDisplayNotes").val(notes);
        document.getElementById("creatureDisplayId").innerHTML = id;

        if (dmb.premiumEncounter.IsPremium) {
            dmb.premiumEncounter.SetPictureData(picturedata)
        }
    }

    function SaveCurrentCreatureThenLoadNext(currentcreature: Creature, nextcreature: Creature): void {
        DeselectRow(currentcreature.Id);
        SaveCreatureNotes(currentcreature);
        FillCreatureDisplayFromCreature(nextcreature);
        dmb.save.SaveCreatureData();
    }

    export function SaveCreatureNotes(creature: Creature) {
        creature.Notes = $("#creatureDisplayNotes").val() as string;
        dmb.save.SaveCreatureData();
    }

    function DeselectRow(creatureid: number): void {
        //$("#" + creatureid + "_delete").prop("disabled", false);
        $(document.getElementById(creatureid + "_row")).removeClass(SELECTEDROWCLASS);
    }

    

    function SelectRow(creatureid: number): void {
        //$("#" + creatureid + "_delete").prop("disabled", true);
        $(document.getElementById(creatureid + "_row")).addClass(SELECTEDROWCLASS);
    }

    export function ShowPreviousCreature(): void {
        if (creatures.length == 0) {
            return;
        }

        let currentcreatureid = GetCurrentCreatureId();
        if (currentcreatureid == null) {
            FillCreatureDisplayFromCreature(creatures[creatures.length - 1]);
            return;
        }

        let currentcreature = creatures.find(c => c.Id == currentcreatureid);
        let currentcreatureindex = creatures.indexOf(currentcreature);
        let previouscreatureindex = currentcreatureindex == 0 ? creatures.length - 1 : Number(currentcreatureindex) - 1;
        let previouscreature = creatures[previouscreatureindex];

        SaveCurrentCreatureThenLoadNext(currentcreature, previouscreature);
    }

    export function HealFromDisplay(): void {
        let amount = Number($("#" + HPCHANGEDISPLAYID).val());
        let idstring = document.getElementById("creatureDisplayId").innerHTML;
        if (idstring === "")
            return;

        let id = Number(idstring);

        ChangeCreatureHPFromIdByAmount(id, amount);
    }

    export function DamageFromDisplay(): void {
        let amount = Number($("#" + HPCHANGEDISPLAYID).val())*-1;
        let idstring = document.getElementById("creatureDisplayId").innerHTML;
        if (idstring === "")
            return;

        let id = Number(idstring);

        ChangeCreatureHPFromIdByAmount(id, amount);
    } 

    export function SaveCreatureNotesModal(): void {
        let creatureid = Number(document.getElementById("creatureNotesModalId").innerHTML);
        let creature = creatures.find(c => c.Id == creatureid);
        let modalNotes = $("#creatureNotesModalNotes").val() as string

        if (GetCurrentCreatureId() == creatureid) {
            $("#creatureDisplayNotes").val(modalNotes)
        }

        creature.Notes = modalNotes;
    }

    export function AddTemplateToLibraryAndResetForm(): void {
        CreateTemplateFromInput();
        ClearCreatureForm();

    }

    export function GetCurrentCreature(): Creature {
        const currentid = GetCurrentCreatureId();
        if (currentid == null)
            return null;

        return creatures.find(c => c.Id == currentid);
    }

    export function GetCreatureTemplate(index: number) {
        if (index >= creatureTemplates.length)
            return null;

        return creatureTemplates[index];
    }

    export function GetCreature(index: number) {
        if (index >= creatures.length)
            return null;

        return creatures[index];
    }

    //export function ClearPage() {
    //    //clear creature table
    //    const creaturetable = document.getElementById("initiativeTable").getElementsByTagName('tbody')[0];
    //    for (let i = 0; i < creaturetable.rows.length; i++) {
    //        creaturetable.deleteRow(i);
    //    }

    //    //clear templates table
    //    const templatetable = document.getElementById("creatureLibraryTable").getElementsByTagName('tbody')[0];
    //    for (let i = 0; i < templatetable.rows.length; i++) {
    //        templatetable.deleteRow(i);
    //    }

    //    //clear creatures
    //    for (let i = 0; i < creatures.length; i++) {
    //        creatures.pop();
    //    }

    //    //clear templates
    //    for (let i = 0; i < creatureTemplates.length; i++) {
    //        creatureTemplates.pop();
    //    }

    //    FillCreatureDisplay("Nothing yet!", "--", "--", "", "", "");
    //}
}
$(dmb.encounter.Init);