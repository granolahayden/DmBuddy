var dmb;
(function (dmb) {
    var encounter;
    (function (encounter) {
        class Creature {
            GetHP() {
                return this.CurrentHP.toString() + "/" + this.MaxHP.toString();
            }
            GetName() {
                if (this.NameCount > 1)
                    return this.Name + " - " + this.NameCount;
                else
                    return this.Name;
            }
        }
        const INITIATIVEINDEX = 0;
        const NAMEINDEX = 1;
        const NOTESINDEX = 2;
        const ACINDEX = 3;
        const HPINDEX = 4;
        const DAMAGEINPUTINDEX = 5;
        const IDINDEX = 6;
        const DELETEINDEX = 7;
        const INITIATIVEREGEX = /\d+\.?\d?/g;
        const HPCHANGEDISPLAYID = "DamageOrHealAmountFromDisplay";
        const SELECTEDROWCLASS = "bg-warning";
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
            $('#creatureNotesModal').on('show.bs.modal', function (event) {
                var button = $(event.relatedTarget);
                var creatureid = button.data('creatureid');
                let creature = creatures.find(c => c.Id == Number(creatureid));
                if (GetCurrentCreatureId() == creatureid) {
                    creature.Notes = $("#creatureDisplayNotes").val();
                }
                document.getElementById("creatureNotesModalLabel").innerHTML = creature.GetName() + " Notes";
                document.getElementById("creatureNotesModalId").innerHTML = creature.Id.toString();
                if (dmb.premiumEncounter.IsPremium) {
                    dmb.premiumEncounter.SetNotesModalPicture(creature.PictureData);
                }
                $("#creatureNotesModalNotes").val(creature.Notes);
            });
            $('#creatureNotesModal').on('hide.bs.modal', function (event) {
                let creatureid = Number(document.getElementById("creatureNotesModalId").innerHTML);
                let creature = creatures.find(c => c.Id == creatureid);
                let modalNotes = $("#creatureNotesModalNotes").val();
                if (GetCurrentCreatureId() == creatureid) {
                    $("#creatureDisplayNotes").val(modalNotes);
                }
                creature.Notes = modalNotes;
            });
        }
        encounter.Init = Init;
        function AddCreaturesAndResetForm() {
            AddCreatures();
            ClearCreatureForm();
        }
        encounter.AddCreaturesAndResetForm = AddCreaturesAndResetForm;
        function AddCreatures() {
            let initiatives = initiativeInput.val().toString().match(INITIATIVEREGEX);
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
                if (dmb.premiumEncounter.IsPremium) {
                    creature.PictureData = dmb.premiumEncounter.GetPictureValue();
                }
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
            row.className = 'align-middle';
            row.id = creature.Id + "_row";
            row.insertCell(INITIATIVEINDEX).innerHTML = creature.Initiative.toString();
            row.insertCell(NAMEINDEX).innerHTML = creature.GetName();
            row.insertCell(NOTESINDEX).innerHTML = "<div class='p-2'><button type='button' class='btn btn-outline-primary' data-bs-toggle='modal' data-bs-target='#creatureNotesModal' data-creatureid='" + creature.Id + "'><i class='bi bi-file-text'></i></button></div>";
            row.insertCell(ACINDEX).innerHTML = creature.AC.toString();
            row.insertCell(HPINDEX).innerHTML = creature.GetHP();
            row.insertCell(DAMAGEINPUTINDEX).innerHTML = "<div class='d-flex flex-row'>" +
                "<div class='text-center p-2'><button type='button' class='btn btn-danger' onclick='dmb.encounter.DamageCreatureFromId(" + creature.Id + ")'>-</button></div>" +
                "<div class='text-center p-2'><input style='width:40px' class='text-center' type='text' id='" + creature.Id + "_DamageOrHealAmountFromTable'/></div>" +
                "<div class='text-center p-2 align-middle'><button type='button' class='btn btn-success' onclick='dmb.encounter.HealCreatureFromId(" + creature.Id + ")'>+</button></div></div>";
            row.insertCell(IDINDEX).outerHTML = "<td style='display:none'>" + creature.Id + "</td>";
            row.insertCell(DELETEINDEX).innerHTML = "<div class='p-2'><button type='button' class='btn btn-danger' id='" + creature.Id + "_delete' onclick='dmb.encounter.RemoveFromInitiative(" + creature.Id + ")'><i class='bi bi-trash'></i></button></div>";
        }
        function ClearCreatureForm() {
            nameInput.val("");
            acInput.val("");
            hpInput.val("");
            initiativeInput.val("");
            notesInput.val("");
            if (dmb.premiumEncounter.IsPremium)
                dmb.premiumEncounter.ClearPictureInput();
            nameInput.focus();
        }
        encounter.ClearCreatureForm = ClearCreatureForm;
        function HealCreatureFromId(id) {
            let amount = Number($("#" + id + "_DamageOrHealAmountFromTable").val());
            ChangeCreatureHPFromIdByAmount(id, amount);
            ;
        }
        encounter.HealCreatureFromId = HealCreatureFromId;
        function ChangeCreatureHPFromIdByAmount(id, amount) {
            let creature = creatures.find(c => c.Id == id);
            creature.CurrentHP += Number(amount);
            let creatureIndex = creatures.indexOf(creature);
            document.getElementById("initiativeTable").getElementsByTagName('tbody')[0].rows[creatureIndex].cells[HPINDEX].innerHTML = creature.GetHP();
            if (Number(document.getElementById("creatureDisplayId").innerHTML) == id) {
                document.getElementById("creatureDisplayHP").innerHTML = creature.GetHP();
            }
        }
        function DamageCreatureFromId(id) {
            let amount = Number($("#" + id + "_DamageOrHealAmountFromTable").val()) * -1;
            ChangeCreatureHPFromIdByAmount(id, amount);
        }
        encounter.DamageCreatureFromId = DamageCreatureFromId;
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
        encounter.ShowNextCreature = ShowNextCreature;
        function GetCurrentCreatureId() {
            return document.getElementById("creatureDisplayId").innerHTML == "" ? null : Number(document.getElementById("creatureDisplayId").innerHTML);
        }
        function SaveCurrentCreatureThenLoadNext(currentcreature, nextcreature) {
            DeselectRow(currentcreature.Id);
            currentcreature.Notes = $("#creatureDisplayNotes").val();
            FillCreatureDisplay(nextcreature);
        }
        function DeselectRow(creatureid) {
            $("#" + creatureid + "_delete").prop("disabled", false);
            $(document.getElementById(creatureid + "_row")).removeClass(SELECTEDROWCLASS);
        }
        function FillCreatureDisplay(creature) {
            document.getElementById("creatureDisplayName").innerHTML = creature.GetName();
            document.getElementById("creatureDisplayHP").innerHTML = creature.GetHP();
            document.getElementById("creatureDisplayAC").innerHTML = creature.AC.toString();
            $("#creatureDisplayNotes").val(creature.Notes);
            document.getElementById("creatureDisplayId").innerHTML = creature.Id.toString();
            if (dmb.premiumEncounter.IsPremium) {
                dmb.premiumEncounter.SetPictureData(creature.PictureData);
            }
            SelectRow(creature.Id);
        }
        function SelectRow(creatureid) {
            $("#" + creatureid + "_delete").prop("disabled", true);
            $(document.getElementById(creatureid + "_row")).addClass(SELECTEDROWCLASS);
        }
        function ShowPreviousCreature() {
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
        encounter.ShowPreviousCreature = ShowPreviousCreature;
        function HealFromDisplay() {
            let amount = Number($("#" + HPCHANGEDISPLAYID).val());
            let id = Number(document.getElementById("creatureDisplayId").innerHTML);
            ChangeCreatureHPFromIdByAmount(id, amount);
        }
        encounter.HealFromDisplay = HealFromDisplay;
        function DamageFromDisplay() {
            let amount = Number($("#" + HPCHANGEDISPLAYID).val()) * -1;
            let id = Number(document.getElementById("creatureDisplayId").innerHTML);
            ChangeCreatureHPFromIdByAmount(id, amount);
        }
        encounter.DamageFromDisplay = DamageFromDisplay;
    })(encounter = dmb.encounter || (dmb.encounter = {}));
})(dmb || (dmb = {}));
$(document).ready(function () {
    dmb.encounter.Init();
});
//# sourceMappingURL=encounter.js.map