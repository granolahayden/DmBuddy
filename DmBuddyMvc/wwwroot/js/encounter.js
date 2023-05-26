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
            constructor(template) {
                this.Id = id++;
                this.CurrentHP = template.MaxHP;
                this.Notes = template.DefaultNotes;
                this.TemplateName = template.GetName();
            }
            GetHP() {
                return this.CurrentHP.toString() + "/" + this.GetCreatureTemplate().MaxHP.toString();
            }
            GetAC() {
                return this.GetCreatureTemplate().AC;
            }
            GetCreatureTemplate() {
                return creatureTemplates.find(ct => ct.GetName() == this.TemplateName);
            }
            GetName() {
                if (this.NameCount > 1)
                    return this.TemplateName + " - " + this.NameCount;
                else
                    return this.TemplateName;
            }
        }
        encounter.Creature = Creature;
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
            currentCreature = null;
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
        function SmartAddFromForm() {
            if (initiativeInput.val().toString().trim() != "")
                AddCreaturesAndResetForm();
            else
                AddTemplateToLibraryAndResetForm();
        }
        function AddCreaturesAndResetForm() {
            if (initiativeInput.val().toString().trim() == "")
                return;
            let templateIndex = creatureTemplates.findIndex(ct => ct.GetName() == nameInput.val());
            if (templateIndex == -1) {
                CreateTemplateFromInput();
                templateIndex = creatureTemplates.length - 1;
            }
            let initiatives = initiativeInput.val().toString().match(encounter.INITIATIVEREGEX);
            if (initiatives.length < 1)
                return;
            AddCreaturesFromTemplateIndex(templateIndex, initiatives);
            ClearCreatureForm();
            dmb.save.SaveCreatureData();
        }
        encounter.AddCreaturesAndResetForm = AddCreaturesAndResetForm;
        function CreateTemplateFromInput() {
            if (creatureTemplates.findIndex(ct => ct.GetName() == nameInput.val()) != -1)
                return;
            let name = nameInput.val();
            let ac = Number(acInput.val());
            let maxhp = Number(hpInput.val());
            let defaultnotes = notesInput.val();
            let namecount = creatureTemplates.filter(ct => ct.Name == name).length + 1;
            let picturedata = dmb.premiumEncounter.IsPremium ? dmb.premiumEncounter.GetPictureValue() : "";
            CreateTemplate(name, ac, maxhp, defaultnotes, namecount, picturedata);
            dmb.save.SaveCreatureTemplateData();
        }
        function CreateTemplate(name, ac, maxhp, defaultnotes, namecount, picturedata) {
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
        encounter.CreateTemplate = CreateTemplate;
        function AddCreaturesFromTemplateIndex(index, initiatives) {
            let template = creatureTemplates[index];
            let nameCount = 0;
            let creaturesWithSameName = creatures.filter(c => c.GetCreatureTemplate().GetName() == template.GetName());
            creaturesWithSameName.forEach(c => { if (Number(nameCount) < Number(c.NameCount))
                nameCount = c.NameCount; });
            for (let i = 0; i < initiatives.length; i++) {
                let creature = new Creature(template);
                creature.NameCount = ++nameCount;
                creature.Initiative = Number(initiatives[i]);
                creature.TemplateName = template.GetName();
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
            if (amount != 0)
                dmb.save.SaveCreatureData();
        }
        function DamageCreatureFromId(id) {
            let amount = Number($("#" + id + "_DamageOrHealAmountFromTable").val()) * -1;
            ChangeCreatureHPFromIdByAmount(id, amount);
        }
        encounter.DamageCreatureFromId = DamageCreatureFromId;
        function RemoveFromInitiative(id) {
            let table = document.getElementById("initiativeTable").getElementsByTagName('tbody')[0];
            let deleteIndex = creatures.findIndex(c => c.Id == id);
            table.deleteRow(deleteIndex);
            if (creatures.length == 1) {
                currentCreature = null;
                FillCreatureDisplay("Nothing yet!", "--", "--", "", null, "");
            }
            else if (creatures.indexOf(GetCurrentCreature()) == deleteIndex) {
                ShowNextCreature();
            }
            creatures.splice(deleteIndex, 1);
            dmb.save.SaveCreatureData();
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
                currentCreature = creatures[0];
                FillCreatureDisplayFromCreature(creatures[0]);
                return;
            }
            let currentcreatureindex = creatures.indexOf(GetCurrentCreature());
            let nextcreatureindex = currentcreatureindex == creatures.length - 1 ? 0 : Number(currentcreatureindex) + 1;
            let nextcreature = creatures[nextcreatureindex];
            SaveCurrentCreatureThenLoadNext(nextcreature);
        }
        encounter.ShowNextCreature = ShowNextCreature;
        function GetCurrentCreatureId() {
            let currentCreature = GetCurrentCreature();
            if (currentCreature == null)
                return null;
            else
                return currentCreature.Id;
        }
        encounter.GetCurrentCreatureId = GetCurrentCreatureId;
        function FillCreatureDisplayFromCreature(creature) {
            FillCreatureDisplay(creature.GetName(), creature.GetHP(), creature.GetAC().toString(), creature.Notes, creature.Id.toString(), creature.GetCreatureTemplate().PictureData);
            SelectRow(creature.Id);
        }
        encounter.FillCreatureDisplayFromCreature = FillCreatureDisplayFromCreature;
        function FillCreatureDisplay(name, hp, ac, notes, id, picturedata) {
            document.getElementById("creatureDisplayName").innerHTML = name;
            document.getElementById("creatureDisplayHP").innerHTML = hp;
            document.getElementById("creatureDisplayAC").innerHTML = ac;
            $("#creatureDisplayNotes").val(notes);
            document.getElementById("creatureDisplayId").innerHTML = id;
            if (dmb.premiumEncounter.IsPremium) {
                dmb.premiumEncounter.SetPictureData(picturedata);
            }
        }
        function SaveCurrentCreatureThenLoadNext(nextcreature) {
            DeselectRow(GetCurrentCreatureId());
            dmb.save.LockSave();
            SaveCreatureNotes(GetCurrentCreature());
            dmb.save.UnlockSave();
            FillCreatureDisplayFromCreature(nextcreature);
            currentCreature = nextcreature;
            dmb.save.SaveCreatureData();
        }
        function SaveCreatureNotes(creature) {
            creature.Notes = $("#creatureDisplayNotes").val();
            dmb.save.SaveCreatureData();
        }
        encounter.SaveCreatureNotes = SaveCreatureNotes;
        function DeselectRow(creatureid) {
            $(document.getElementById(creatureid + "_row")).removeClass(SELECTEDROWCLASS);
        }
        function SelectRow(creatureid) {
            $(document.getElementById(creatureid + "_row")).addClass(SELECTEDROWCLASS);
        }
        function ShowPreviousCreature() {
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
            SaveCurrentCreatureThenLoadNext(previouscreature);
        }
        encounter.ShowPreviousCreature = ShowPreviousCreature;
        function HealFromDisplay() {
            let amount = Number($("#" + HPCHANGEDISPLAYID).val());
            let idstring = document.getElementById("creatureDisplayId").innerHTML;
            if (idstring === "")
                return;
            let id = Number(idstring);
            ChangeCreatureHPFromIdByAmount(id, amount);
        }
        encounter.HealFromDisplay = HealFromDisplay;
        function DamageFromDisplay() {
            let amount = Number($("#" + HPCHANGEDISPLAYID).val()) * -1;
            let idstring = document.getElementById("creatureDisplayId").innerHTML;
            if (idstring === "")
                return;
            let id = Number(idstring);
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
            return currentCreature;
        }
        encounter.GetCurrentCreature = GetCurrentCreature;
        function SetCurrentCreatureById(id) {
            if (id == null)
                currentCreature = null;
            else {
                currentCreature = creatures.find(c => c.Id == id);
            }
        }
        encounter.SetCurrentCreatureById = SetCurrentCreatureById;
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
        function GetCreatureTemplates() {
            return creatureTemplates;
        }
        encounter.GetCreatureTemplates = GetCreatureTemplates;
        function GetCreatures() {
            return creatures;
        }
        encounter.GetCreatures = GetCreatures;
    })(encounter = dmb.encounter || (dmb.encounter = {}));
})(dmb || (dmb = {}));
$(dmb.encounter.Init);
//# sourceMappingURL=encounter.js.map