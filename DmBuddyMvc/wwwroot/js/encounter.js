var dmb;
(function (dmb) {
    var encounter;
    (function (encounter) {
        class Creature {
            GetHP() {
                return this.CurrentHP.toString() + "/" + this.MaxHP.toString();
            }
        }
        const initiativeIndex = 0;
        const nameIndex = 1;
        const hpIndex = 2;
        const damageInputIndex = 3;
        const idIndex = 4;
        const deleteIndex = 5;
        const initiativeRegex = /\d+\.?\d?/g;
        function Init() {
            creatures = [];
            id = 0;
            nameInput = $("#creatureNameInput");
            acInput = $("#creatureACInput");
            hpInput = $("#creatureHPInput");
            initiativeInput = $("#creatureInitiativeInput");
            notesInput = $("#creatureNotesInput");
            $("#addCreatureModal").on('show.bs.modal', function (event) {
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
        encounter.Init = Init;
        function AddCreaturesAndResetForm() {
            AddCreatures();
            ClearCreatureForm();
        }
        encounter.AddCreaturesAndResetForm = AddCreaturesAndResetForm;
        function AddCreatures() {
            let initiatives = initiativeInput.val().toString().match(initiativeRegex);
            if (initiatives.length < 1)
                return;
            let nameCount = 0;
            let creaturesWithSameName = creatures.filter(c => c.Name == nameInput.val());
            creaturesWithSameName.forEach(c => { if (Number(nameCount) < Number(c.NameCount))
                nameCount = c.NameCount; });
            let name = nameInput.val();
            let ac = Number(acInput.val());
            let hp = Number(hpInput.val());
            let notes = notesInput.val();
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
        encounter.AddCreatures = AddCreatures;
        function AddCreature(creature) {
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
            row.insertCell(nameIndex).innerHTML = creature.NameCount > 1 ? creature.Name + " - " + creature.NameCount : creature.Name;
            row.insertCell(hpIndex).innerHTML = creature.GetHP();
            row.insertCell(damageInputIndex).innerHTML = "<div class='d-flex flex-row'>" +
                "<div class='text-center p-2'><button type='button' class='btn btn-danger' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + ", \"-\")'>-</button></div>" +
                "<div class='text-center p-2'><input style='width:100%' class='text-center' type='text' id='" + creature.Id + "_DamageOrHealAmount'/></div>" +
                "<div class='text-center p-2 align-middle'><button type='button' class='btn btn-success' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + ")'>+</button></div></div>";
            row.insertCell(idIndex).outerHTML = "<td style='display:none'>" + creature.Id + "</td>";
            row.insertCell(deleteIndex).innerHTML = "<button type='button' class='btn btn-outline-danger' onclick='dmb.encounter.RemoveFromInitiative(" + creature.Id + ")'><i class='bi bi-trash'></i></button>";
        }
        function ClearCreatureForm() {
            nameInput.val("");
            acInput.val("");
            hpInput.val("");
            initiativeInput.val("");
            nameInput.focus();
        }
        encounter.ClearCreatureForm = ClearCreatureForm;
        function HealCreatureFromId(id, sign = "+") {
            let amount = Number($("#" + id + "_DamageOrHealAmount").val());
            if (sign === "-")
                amount = -amount;
            let creature = creatures.find(c => c.Id == id);
            creature.CurrentHP = Number(creature.CurrentHP) + Number(amount);
            let creatureIndex = creatures.indexOf(creature);
            let rows = document.getElementById("initiativeTable").getElementsByTagName('tbody')[0].rows;
            rows[creatureIndex].cells[hpIndex].innerHTML = creature.GetHP();
        }
        encounter.HealCreatureFromId = HealCreatureFromId;
        function RemoveFromInitiative(id) {
            let table = document.getElementById("initiativeTable").getElementsByTagName('tbody')[0];
            let deleteIndex = creatures.indexOf(creatures.find(c => c.Id == id));
            table.deleteRow(deleteIndex);
            creatures.splice(deleteIndex, 1);
        }
        encounter.RemoveFromInitiative = RemoveFromInitiative;
        function ShowNextCreature() {
            if (creatures.length == 0) {
                return;
            }
            else if (currentCreatureId == null) {
                FillCreatureDisplay(creatures[0]);
                currentCreatureId = creatures[0].Id;
                return;
            }
            let currentcreatureindex = creatures.indexOf(creatures.find(c => c.Id == currentCreatureId));
            let nextcreatureindex = currentcreatureindex == creatures.length - 1 ? 0 : Number(currentcreatureindex) + 1;
            let nextcreature = creatures[nextcreatureindex];
            FillCreatureDisplay(nextcreature);
            currentCreatureId = nextcreature.Id;
        }
        encounter.ShowNextCreature = ShowNextCreature;
        function FillCreatureDisplay(creature) {
            document.getElementById("creatureDisplayName");
            document.getElementById("creatureDisplayHP").innerHTML = creature.GetHP();
            document.getElementById("creatureDisplayAC").innerHTML = creature.AC.toString();
            $("creatureDisplayNotes").val(creature.Notes);
        }
        function ShowPreviousCreature() {
            if (creatures.length == 0) {
                return;
            }
            else if (currentCreatureId == null) {
                FillCreatureDisplay(creatures[creatures.length - 1]);
                currentCreatureId = creatures[creatures.length - 1].Id;
                return;
            }
            let currentcreatureindex = creatures.indexOf(creatures.find(c => c.Id == currentCreatureId));
            let previouscreatureindex = currentcreatureindex == 0 ? creatures.length - 1 : Number(currentcreatureindex) - 1;
        }
        encounter.ShowPreviousCreature = ShowPreviousCreature;
    })(encounter = dmb.encounter || (dmb.encounter = {}));
})(dmb || (dmb = {}));
$(document).ready(function () {
    dmb.encounter.Init();
});
//# sourceMappingURL=encounter.js.map