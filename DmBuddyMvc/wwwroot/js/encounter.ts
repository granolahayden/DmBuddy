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

    class Creature {
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
                AddCreaturesAndResetForm();
            }
        });

        $("#creatureHPInput").on("keyup", function (e) {
            if (e.key === "Enter") {
                AddCreaturesAndResetForm();
            }
        });

        $("#creatureACInput").on("keyup", function (e) {
            if (e.key === "Enter") {
                AddCreaturesAndResetForm();
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

    export function AddCreaturesAndResetForm(): void {
        CreateTemplateFromInput();

        let initiatives = initiativeInput.val().toString().match(INITIATIVEREGEX);
        if (initiatives.length < 1)
            return;

        AddCreaturesFromTemplateIndex(creatureTemplates.length - 1, initiatives);
        ClearCreatureForm();
    }

    function CreateTemplateFromInput(): void {
        let template = new CreatureTemplate();
        template.Name = nameInput.val() as string;
        template.AC = Number(acInput.val());
        template.MaxHP = Number(hpInput.val());
        template.DefaultNotes = notesInput.val() as string;
        template.NameCount = creatureTemplates.filter(ct => ct.Name == template.Name).length + 1;

        if (dmb.premiumEncounter.IsPremium)
            template.PictureData = dmb.premiumEncounter.GetPictureValue();

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
    }

    export function ClearCreatureForm(): void {
        nameInput.val("");
        acInput.val("");
        hpInput.val("");
        initiativeInput.val("");
        notesInput.val("");

        if (dmb.premiumEncounter.IsPremium)
            dmb.premiumEncounter.ClearPictureInput();

        nameInput.focus();
    }

    export function ShowNextCreature(): void {
        if (creatures.length == 0) {
            return;
        }

        let currentcreatureid = GetCurrentCreatureId();
        if (currentcreatureid == null) {
            FillCreatureDisplay(creatures[0]);
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

    function FillCreatureDisplay(creature: Creature): void {
        document.getElementById("creatureDisplayName").innerHTML = creature.GetName();
        document.getElementById("creatureDisplayHP").innerHTML = creature.GetHP();
        document.getElementById("creatureDisplayAC").innerHTML = creature.GetAC().toString();
        $("#creatureDisplayNotes").val(creature.Notes);
        document.getElementById("creatureDisplayId").innerHTML = creature.Id.toString();

        if (dmb.premiumEncounter.IsPremium) {
            dmb.premiumEncounter.SetPictureData(creature.GetCreatureTemplate().PictureData)
        }

        SelectRow(creature.Id);
    }

    function SaveCurrentCreatureThenLoadNext(currentcreature: Creature, nextcreature: Creature): void {
        DeselectRow(currentcreature.Id);
        currentcreature.Notes = $("#creatureDisplayNotes").val() as string;
        FillCreatureDisplay(nextcreature);
    }

    function DeselectRow(creatureid: number): void {
        $("#" + creatureid + "_delete").prop("disabled", false);
        $(document.getElementById(creatureid + "_row")).removeClass(SELECTEDROWCLASS);
    }

    

    function SelectRow(creatureid: number): void {
        $("#" + creatureid + "_delete").prop("disabled", true);
        $(document.getElementById(creatureid + "_row")).addClass(SELECTEDROWCLASS);
    }

    export function ShowPreviousCreature(): void {
        if (creatures.length == 0) {
            return;
        }

        let currentcreatureid = GetCurrentCreatureId();
        if (currentcreatureid == null) {
            FillCreatureDisplay(creatures[creatures.length - 1]);
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
        let id = Number(document.getElementById("creatureDisplayId").innerHTML);

        ChangeCreatureHPFromIdByAmount(id, amount);
    }

    export function DamageFromDisplay(): void {
        let amount = Number($("#" + HPCHANGEDISPLAYID).val())*-1;
        let id = Number(document.getElementById("creatureDisplayId").innerHTML);

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
}
$(dmb.encounter.Init);