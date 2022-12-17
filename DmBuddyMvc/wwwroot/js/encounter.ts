namespace dmb.encounter
{
    class Creature {
        Id: number;
        Name: string;
        NameCount: number;
        AC: number;
        CurrentHP: number;
        MaxHP: number;
        Initiative: number;
        Notes: string;

        GetHP(): string {
            return this.CurrentHP.toString() + "/" + this.MaxHP.toString();
        }

        GetName(): string {
            if (this.NameCount > 1)
                return this.Name + " - " + this.NameCount;
            else
                return this.Name;
        }
    }

    const INITIATIVEINDEX: number = 0;
    const NAMEINDEX: number = 1;
    const HPINDEX: number = 2;
    const DAMAGEINPUTINDEX: number = 3;
    const IDINDEX: number = 4;
    const DELETEINDEX: number = 5;

    const INITIATIVEREGEX = /\d+\.?\d?/g;

    const HPCHANGEDISPLAYID = "DamageOrHealAmountFromDisplay";
    const SELECTEDROWCLASS = "bg-warning";

    declare let creatures: Creature[];
    declare let id: number;

    declare let nameInput: JQuery<HTMLElement>;
    declare let acInput: JQuery<HTMLElement>;
    declare let hpInput: JQuery<HTMLElement>;
    declare let initiativeInput: JQuery<HTMLElement>;
    declare let notesInput: JQuery<HTMLElement>;

    export function Init(): void {
        creatures = [];
        id = 0;

        nameInput = $("#creatureNameInput");
        acInput = $("#creatureACInput");
        hpInput = $("#creatureHPInput");
        initiativeInput = $("#creatureInitiativeInput");
        notesInput = $("#creatureNotesInput");

        $("#addCreatureModal").on('show.bs.modal', function (event: JQueryEventObject) {
            setTimeout(function () {
                nameInput.focus();
            }, 500);
        });

        $("#creatureInitiativeInput").keyup(function (e) {
            if (e.keyCode === 13) {
                AddCreaturesAndResetForm();
            }
        });

        $("#creatureHPInput").keyup(function (e) {
            if (e.keyCode === 13) {
                AddCreaturesAndResetForm();
            }
        });

        $("#creatureACInput").keyup(function (e) {
            if (e.keyCode === 13) {
                AddCreaturesAndResetForm();
            }
        });

        $("#creatureDisplayNotes").val("");
        $("#DamageOrHealAmountFromDisplay").val("");
    }

    export function AddCreaturesAndResetForm(): void {
        AddCreatures();
        ClearCreatureForm();
    }

    export function AddCreatures(): void {
        let initiatives = initiativeInput.val().toString().match(INITIATIVEREGEX);
        if (initiatives.length < 1)
            return;

        let nameCount = 0;
        let creaturesWithSameName = creatures.filter(c => c.Name == nameInput.val() as string);
        creaturesWithSameName.forEach(c => { if (Number(nameCount) < Number(c.NameCount)) nameCount = c.NameCount; })

        let name = nameInput.val() as string;
        let ac = Number(acInput.val());
        let hp = Number(hpInput.val());
        let notes = notesInput.val() as string;

        for (let i = 0; i < initiatives.length; i++) {
            let creature = new Creature();
            creature.Name = name;
            creature.Id = id++;
            creature.NameCount = ++nameCount;
            creature.Initiative = Number(initiatives[i]);
            creature.AC = ac;
            creature.CurrentHP = hp;
            creature.MaxHP = hp;
            creature.Notes = notes;

            AddCreature(creature);
        }
    }

    export function AddCreature(creature: Creature): void {
        var table = document.getElementById("initiativeTable") as HTMLTableElement;

        if (creatures.length == 0) {
            InsertCreatureIntoTableAtIndex(creature, table, 0);
            return;
        }

        let i: number;
        for (i = 0; i < creatures.length; i++) {
            if (Number(creature.Initiative) > Number(creatures[i].Initiative)) {
                InsertCreatureIntoTableAtIndex(creature, table, i);
                return;
            }
        }

        InsertCreatureIntoTableAtIndex(creature, table, i);
    }

    function InsertCreatureIntoTableAtIndex(creature: Creature, table: HTMLTableElement, index: number): void {

        creatures.splice(index, 0, creature);

        let row = table.getElementsByTagName('tbody')[0].insertRow(index);
        row.id = creature.Id + "_row";
        row.insertCell(INITIATIVEINDEX).innerHTML = creature.Initiative.toString();
        row.insertCell(NAMEINDEX).innerHTML = creature.GetName();
        row.insertCell(HPINDEX).innerHTML = creature.GetHP();
        row.insertCell(DAMAGEINPUTINDEX).innerHTML = "<div class='d-flex flex-row'>" +
            "<div class='text-center p-2'><button type='button' class='btn btn-danger' onclick='dmb.encounter.DamageCreatureFromId(" + creature.Id + ")'>-</button></div>" +
            "<div class='text-center p-2'><input style='width:100%' class='text-center' type='text' id='" + creature.Id + "_DamageOrHealAmountFromTable'/></div>" +
            "<div class='text-center p-2 align-middle'><button type='button' class='btn btn-success' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + ")'>+</button></div></div>";
        row.insertCell(IDINDEX).outerHTML = "<td style='display:none'>" + creature.Id + "</td>";
        row.insertCell(DELETEINDEX).innerHTML = "<div class='p-2'><button type='button' class='btn btn-danger' id='"+creature.Id+"_delete' onclick='dmb.encounter.RemoveFromInitiative(" + creature.Id + ")'><i class='bi bi-trash'></i></button></div>";
    }

    export function ClearCreatureForm(): void {
        nameInput.val("");
        acInput.val("");
        hpInput.val("");
        initiativeInput.val("");
        notesInput.val("");
        nameInput.focus();
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

    function SaveCurrentCreatureThenLoadNext(currentcreature: Creature, nextcreature: Creature): void {
        DeselectRow(currentcreature.Id);
        currentcreature.Notes = $("#creatureDisplayNotes").val() as string;
        FillCreatureDisplay(nextcreature);
    }

    function DeselectRow(creatureid: number): void {
        $("#" + creatureid + "_delete").prop("disabled", false);
        $(document.getElementById(creatureid + "_row")).removeClass(SELECTEDROWCLASS);
    }

    function FillCreatureDisplay(creature: Creature): void {
        document.getElementById("creatureDisplayName").innerHTML = creature.GetName();
        document.getElementById("creatureDisplayHP").innerHTML = creature.GetHP();
        document.getElementById("creatureDisplayAC").innerHTML = creature.AC.toString();
        $("#creatureDisplayNotes").val(creature.Notes);
        document.getElementById("creatureDisplayId").innerHTML = creature.Id.toString();

        SelectRow(creature.Id);
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
}

$(document).ready(function (): void {
    dmb.encounter.Init();
});