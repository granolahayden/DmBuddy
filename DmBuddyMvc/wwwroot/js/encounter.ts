namespace dmb.encounter
{
    class Creature {
        Id: number;
        Name: string;
        AC: number;
        HP: number;
        Initiative: number;
    }

    const initiativeIndex: number = 0;
    const nameIndex: number = 1;
    const hpIndex: number = 2;
    const damageInputIndex: number = 3;
    const idIndex: number = 4;

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
    }

    export function AddCreature(): void {
        let creature = new Creature();
        creature.Id = id++;

        creature.Name = nameInput.val() as string;
        creature.AC = acInput.val() as number;
        creature.HP = hpInput.val() as number;
        creature.Initiative = initiativeInput.val() as number;

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
        row.insertCell(nameIndex).innerHTML = creature.Name;
        row.insertCell(hpIndex).innerHTML = creature.HP.toString();
        row.insertCell(damageInputIndex).innerHTML = "<button type='button' class='btn btn-danger' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + ", \"-\")'>-</button>" +
            "<input style='width:40%' type='number' id='" + creature.Id + "_DamageOrHealAmount'/>" +
            "<button type='button' class='btn btn-success' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + ")'>+</button>";
        row.insertCell(idIndex).outerHTML = "<td style='display:none'>" + creature.Id + "</td>";
    }

    export function HealCreatureFromId(id: number, sign: string = "+"): void {
        console.log("doing health: " + id + " " + sign);
        
        let amount: number = Number($("#" + id + "_DamageOrHealAmount").val());
        if (sign === "-")
            amount = -amount;

        let creature = creatures.find(c => c.Id == id);
        creature.HP = Number(creature.HP)+Number(amount);

        let rows = document.getElementById("initiativeTable").getElementsByTagName('tbody')[0].rows;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].cells[idIndex].innerHTML == id.toString()) {
                rows[i].cells[hpIndex].innerHTML = creature.HP.toString();
                return;
            }
        }
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