var dmb;
(function (dmb) {
    var encounter;
    (function (encounter) {
        class Creature {
        }
        const initiativeIndex = 0;
        const nameIndex = 1;
        const hpIndex = 2;
        const damageInputIndex = 3;
        const idIndex = 4;
        function Init() {
            creatures = [];
            id = 0;
            nameInput = $("#creatureNameInput");
            acInput = $("#creatureACInput");
            hpInput = $("#creatureHPInput");
            initiativeInput = $("#creatureInitiativeInput");
            $("#addCreatureModal").on('show.bs.modal', function (event) {
                setTimeout(function () {
                    nameInput.focus();
                }, 500);
            });
        }
        encounter.Init = Init;
        function AddCreature() {
            let creature = new Creature();
            creature.Id = id++;
            creature.Name = nameInput.val();
            creature.AC = acInput.val();
            creature.HP = hpInput.val();
            creature.Initiative = initiativeInput.val();
            var table = document.getElementById("initiativeTable");
            if (creatures.length == 0) {
                InsertCreatureIntoTableAtIndex(creature, table, 0);
                return;
            }
            let i;
            for (i = 0; i < creatures.length; i++) {
                if (Number(creature.Initiative) > Number(creatures[i].Initiative)) {
                    InsertCreatureIntoTableAtIndex(creature, table, i);
                    return;
                }
            }
            InsertCreatureIntoTableAtIndex(creature, table, i);
        }
        encounter.AddCreature = AddCreature;
        function InsertCreatureIntoTableAtIndex(creature, table, index) {
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
        function HealCreatureFromId(id, sign = "+") {
            console.log("doing health: " + id + " " + sign);
            let amount = Number($("#" + id + "_DamageOrHealAmount").val());
            if (sign === "-")
                amount = -amount;
            let creature = creatures.find(c => c.Id == id);
            creature.HP = Number(creature.HP) + Number(amount);
            let rows = document.getElementById("initiativeTable").getElementsByTagName('tbody')[0].rows;
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].cells[idIndex].innerHTML == id.toString()) {
                    rows[i].cells[hpIndex].innerHTML = creature.HP.toString();
                    return;
                }
            }
        }
        encounter.HealCreatureFromId = HealCreatureFromId;
        function ClearCreatureForm() {
            nameInput.val("");
            acInput.val("");
            hpInput.val("");
            initiativeInput.val("");
            nameInput.focus();
        }
        encounter.ClearCreatureForm = ClearCreatureForm;
    })(encounter = dmb.encounter || (dmb.encounter = {}));
})(dmb || (dmb = {}));
$(document).ready(function () {
    dmb.encounter.Init();
});
//# sourceMappingURL=encounter.js.map