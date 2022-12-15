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
    }

    const initiativeIndex: number = 0;
    const nameIndex: number = 1;
    const hpIndex: number = 2;
    const damageInputIndex: number = 3;
    const idIndex: number = 4;
    const deleteIndex: number = 5;

    const initiativeRegex = /\d+\.?\d?/g;

    declare let creatures: Creature[];
    declare let id: number;
    declare let nameInput: JQuery<HTMLElement>;
    declare let acInput: JQuery<HTMLElement>;
    declare let hpInput: JQuery<HTMLElement>;
    declare let initiativeInput: JQuery<HTMLElement>;

    export function Init(): void {
        creatures = [];
        id = 0;

        nameInput = $("#creatureNameInput");
        acInput = $("#creatureACInput");
        hpInput = $("#creatureHPInput");
        initiativeInput = $("#creatureInitiativeInput");

        $("#addCreatureModal").on('show.bs.modal', function (event: JQueryEventObject) {
            setTimeout(function () {
                nameInput.focus();
            }, 500);
        });

        $("#addCreatureModal").keyup(function (e) {
            if (e.keyCode === 13) {
                AddCreaturesAndResetForm();
            }
        });
    }

    export function AddCreaturesAndResetForm(): void {
        AddCreatures();
        ClearCreatureForm();
    }

    export function AddCreatures(): void {
        //let initiatives = initiativeInput.val().toString().split(",");
        let initiatives = initiativeInput.val().toString().match(initiativeRegex);
        if (initiatives.length < 1)
            return;

        //if this creature name already exists in the table, add a ' - 1'...
        let nameCount = 0;
        let creaturesWithSameName = creatures.filter(c => c.Name == nameInput.val() as string);
        creaturesWithSameName.forEach(c => { if (Number(nameCount) < Number(c.NameCount)) nameCount = c.NameCount; })

        let name = nameInput.val() as string;
        let ac = Number(acInput.val());
        let hp = Number(hpInput.val());

        for (let i = 0; i < initiatives.length; i++) {
            let creature = new Creature();
            creature.Name = name;
            creature.Id = id++;
            creature.NameCount = ++nameCount;
            creature.Initiative = Number(initiatives[i]);
            creature.AC = ac;
            creature.CurrentHP = hp;
            creature.MaxHP = hp;

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
        row.insertCell(initiativeIndex).innerHTML = creature.Initiative.toString();
        row.insertCell(nameIndex).innerHTML = creature.NameCount > 1 ? creature.Name + " - " + creature.NameCount : creature.Name;
        row.insertCell(hpIndex).innerHTML = creature.GetHP();
        row.insertCell(damageInputIndex).innerHTML = "<div class='d-flex flex-row'>" +
            "<div class='text-center p-2'><button type='button' class='btn btn-danger' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + ", \"-\")'>-</button></div>" +
            "<div class='text-center p-2'><input style='width:100%' type='text' id='" + creature.Id + "_DamageOrHealAmount'/></div>" +
            "<div class='text-center p-2 align-middle'><button type='button' class='btn btn-success' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + ")'>+</button></div></div>";
        row.insertCell(idIndex).outerHTML = "<td style='display:none'>" + creature.Id + "</td>";
        row.insertCell(deleteIndex).innerHTML = "<button type='button' class='btn btn-outline-danger' onclick='dmb.encounter.RemoveFromInitiative(" + creature.Id + ")'><i class='bi bi-trash'></i></button>";
    }

    export function HealCreatureFromId(id: number, sign: string = "+"): void {        
        let amount: number = Number($("#" + id + "_DamageOrHealAmount").val());
        if (sign === "-")
            amount = -amount;

        let creature = creatures.find(c => c.Id == id);
        creature.CurrentHP = Number(creature.CurrentHP) + Number(amount);

        let creatureIndex = creatures.indexOf(creature);
        let rows = document.getElementById("initiativeTable").getElementsByTagName('tbody')[0].rows;
        rows[creatureIndex].cells[hpIndex].innerHTML = creature.GetHP();
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
        nameInput.focus();
    }
}

$(document).ready(function (): void {
    dmb.encounter.Init();
});