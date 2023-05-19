var dmb;
(function (dmb) {
    var encounter;
    (function (encounter) {
        class CreatureTemplate {
            GetName() {
                if (this.NameCount > 1)
                    return this.Name + " (" + this.NameCount + ")";
                else
                    return this.Name;
            }
        }
        encounter.CreatureTemplate = CreatureTemplate;
        class Creature {
            constructor(template, templateIndex) {
                this.Id = id++;
                this.CurrentHP = template.MaxHP;
                this.Notes = template.DefaultNotes;
                this.CreatureIndex = Number(templateIndex);
            }
            GetHP() {
                return this.CurrentHP.toString() + "/" + this.GetCreatureTemplate().MaxHP.toString();
            }
            GetAC() {
                return this.GetCreatureTemplate().AC;
            }
            GetCreatureTemplate() {
                return creatureTemplates[this.CreatureIndex];
            }
            GetName() {
                if (this.NameCount > 1)
                    return this.GetCreatureTemplate().GetName() + " - " + this.NameCount;
                else
                    return this.GetCreatureTemplate().GetName();
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
        encounter.INITIATIVEREGEX = /\d+\.?\d?/g;
        const HPCHANGEDISPLAYID = "DamageOrHealAmountFromDisplay";
        const SELECTEDROWCLASS = "bg-warning";
        function Init() {
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
                    dmb.premiumEncounter.SetNotesModalPicture(creature.GetCreatureTemplate().PictureData);
                }
                $("#creatureNotesModalNotes").val(creature.Notes);
            });
        }
        encounter.Init = Init;
        function AddCreaturesAndResetForm() {
            CreateTemplateFromInput();
            let initiatives = initiativeInput.val().toString().match(encounter.INITIATIVEREGEX);
            if (initiatives.length < 1)
                return;
            AddCreaturesFromTemplateIndex(creatureTemplates.length - 1, initiatives);
            ClearCreatureForm();
        }
        encounter.AddCreaturesAndResetForm = AddCreaturesAndResetForm;
        function CreateTemplateFromInput() {
            let template = new CreatureTemplate();
            template.Name = nameInput.val();
            template.AC = Number(acInput.val());
            template.MaxHP = Number(hpInput.val());
            template.DefaultNotes = notesInput.val();
            template.NameCount = creatureTemplates.filter(ct => ct.Name == template.Name).length + 1;
            if (dmb.premiumEncounter.IsPremium)
                template.PictureData = dmb.premiumEncounter.GetPictureValue();
            dmb.library.InsertTemplateToTable(template, creatureTemplates.length);
            creatureTemplates.push(template);
        }
        function AddCreaturesFromTemplateIndex(index, initiatives) {
            let template = creatureTemplates[index];
            let nameCount = 0;
            let creaturesWithSameName = creatures.filter(c => c.GetCreatureTemplate().GetName() == template.GetName());
            creaturesWithSameName.forEach(c => { if (Number(nameCount) < Number(c.NameCount))
                nameCount = c.NameCount; });
            for (let i = 0; i < initiatives.length; i++) {
                let creature = new Creature(template, index);
                creature.NameCount = ++nameCount;
                creature.Initiative = Number(initiatives[i]);
                AddCreature(creature);
            }
        }
        encounter.AddCreaturesFromTemplateIndex = AddCreaturesFromTemplateIndex;
        function AddCreature(creature) {
            var table = document.getElementById("initiativeTable");
            let insertIndex = GetCreatureInsertIndex(creature);
            creatures.splice(insertIndex, 0, creature);
            InsertCreatureIntoTableAtIndex(creature, table, insertIndex);
        }
        encounter.AddCreature = AddCreature;
        function GetCreatureInsertIndex(creature) {
            let i;
            for (i = 0; i < creatures.length; i++) {
                if (Number(creature.Initiative > Number(creatures[i].Initiative))) {
                    break;
                }
            }
            return i;
        }
        function InsertCreatureIntoTableAtIndex(creature, table, index) {
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
        function ClearDamageOrHealInput(id) {
            $("#" + id + "_DamageOrHealAmountFromTable").val('');
        }
        encounter.ClearDamageOrHealInput = ClearDamageOrHealInput;
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
        function ClearCreatureForm() {
            nameInput.val("");
            acInput.val("");
            hpInput.val("");
            initiativeInput.val("");
            notesInput.val("");
            if (dmb.premiumEncounter.IsPremium)
                dmb.premiumEncounter.ClearPictureInput();
            nameInput.trigger("focus");
        }
        encounter.ClearCreatureForm = ClearCreatureForm;
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
        function FillCreatureDisplay(creature) {
            document.getElementById("creatureDisplayName").innerHTML = creature.GetName();
            document.getElementById("creatureDisplayHP").innerHTML = creature.GetHP();
            document.getElementById("creatureDisplayAC").innerHTML = creature.GetAC().toString();
            $("#creatureDisplayNotes").val(creature.Notes);
            document.getElementById("creatureDisplayId").innerHTML = creature.Id.toString();
            if (dmb.premiumEncounter.IsPremium) {
                dmb.premiumEncounter.SetPictureData(creature.GetCreatureTemplate().PictureData);
            }
            SelectRow(creature.Id);
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
        function SaveCreatureNotesModal() {
            let creatureid = Number(document.getElementById("creatureNotesModalId").innerHTML);
            let creature = creatures.find(c => c.Id == creatureid);
            let modalNotes = $("#creatureNotesModalNotes").val();
            if (GetCurrentCreatureId() == creatureid) {
                $("#creatureDisplayNotes").val(modalNotes);
            }
            creature.Notes = modalNotes;
        }
        encounter.SaveCreatureNotesModal = SaveCreatureNotesModal;
        function AddTemplateToLibraryAndResetForm() {
            CreateTemplateFromInput();
            ClearCreatureForm();
        }
        encounter.AddTemplateToLibraryAndResetForm = AddTemplateToLibraryAndResetForm;
        function GetCurrentCreature() {
            const currentid = GetCurrentCreatureId();
            if (currentid == null)
                return null;
            return creatures.find(c => c.Id == currentid);
        }
        encounter.GetCurrentCreature = GetCurrentCreature;
        function GetCreatureTemplate(index) {
            if (index >= creatureTemplates.length)
                return null;
            return creatureTemplates[index];
        }
        encounter.GetCreatureTemplate = GetCreatureTemplate;
        function GetCreature(index) {
            if (index >= creatures.length)
                return null;
            return creatures[index];
        }
        encounter.GetCreature = GetCreature;
    })(encounter = dmb.encounter || (dmb.encounter = {}));
})(dmb || (dmb = {}));
$(dmb.encounter.Init);
//# sourceMappingURL=encounter.js.map