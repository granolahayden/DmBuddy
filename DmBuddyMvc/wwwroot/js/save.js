var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var dmb;
(function (dmb) {
    var save;
    (function (save) {
        let SaveLock;
        let EncounterName;
        function CanSave() {
            return SaveLock == false && EncounterName != null;
        }
        save.CanSave = CanSave;
        function init() {
            var _a, _b;
            SaveLock = false;
            EncounterName = ((_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML) != undefined ? (_b = document.getElementById("encounterName")) === null || _b === void 0 ? void 0 : _b.innerHTML : null;
            if (CanSave()) {
                LoadEncounter();
            }
        }
        save.init = init;
        function LockSave() {
            SaveLock = true;
        }
        save.LockSave = LockSave;
        function UnlockSave() {
            SaveLock = false;
        }
        save.UnlockSave = UnlockSave;
        function SaveCreatureData() {
            if (!CanSave())
                return;
            let creatures = [];
            let currentCreature = dmb.encounter.GetCreature(0);
            for (let i = 1; currentCreature != null; i++) {
                creatures.push({
                    Id: currentCreature.Id,
                    NameCount: currentCreature.NameCount,
                    TemplateName: currentCreature.TemplateName,
                    Initiative: currentCreature.Initiative,
                    CurrentHP: currentCreature.CurrentHP,
                    Notes: currentCreature.Notes
                });
                currentCreature = dmb.encounter.GetCreature(i);
            }
            let creaturesjson = {
                CurrentId: dmb.encounter.GetCurrentCreatureId(),
                Creatures: creatures
            };
            $.post("/Encounter/SaveCreatureData", {
                __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
                encountername: EncounterName,
                creaturedata: creaturesjson
            });
        }
        save.SaveCreatureData = SaveCreatureData;
        function SaveCreatureTemplateData() {
            if (!CanSave())
                return;
            let creatureTemplates = [];
            let currentCreatureTemplate = dmb.encounter.GetCreatureTemplate(0);
            for (let i = 1; currentCreatureTemplate != null; i++) {
                creatureTemplates.push({
                    Name: currentCreatureTemplate.Name,
                    NameCount: currentCreatureTemplate.NameCount,
                    MaxHP: currentCreatureTemplate.MaxHP,
                    AC: currentCreatureTemplate.AC,
                    DefaultNotes: currentCreatureTemplate.DefaultNotes,
                    PictureData: currentCreatureTemplate.PictureData
                });
                currentCreatureTemplate = dmb.encounter.GetCreatureTemplate(i);
            }
            let templatesjson = {
                CreatureTemplates: creatureTemplates
            };
            $.post("/Encounter/SaveCreatureTemplateData", {
                __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
                encountername: EncounterName,
                creaturetemplatedata: templatesjson
            });
        }
        save.SaveCreatureTemplateData = SaveCreatureTemplateData;
        function LoadEncounter() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!CanSave())
                    return;
                var result = yield fetch("/Encounter/LoadEncounter/" + EncounterName, {
                    headers: {
                        'Accept': 'application/json'
                    },
                    method: 'get'
                }).then(response => response.json());
                if (result != "")
                    PopulateEncounterFromJson(JSON.parse(result));
            });
        }
        save.LoadEncounter = LoadEncounter;
        function PopulateEncounterFromJson(encounterJson) {
            let creatureTemplates = encounterJson.CreatureTemplates;
            let creatures = encounterJson.Creatures;
            for (let i = 0; i < creatureTemplates.length; i++) {
                dmb.encounter.CreateTemplate(creatureTemplates[i].Name, creatureTemplates[i].AC, creatureTemplates[i].MaxHP, creatureTemplates[i].DefaultNotes, creatureTemplates[i].NameCount, creatureTemplates[i].PictureData);
                let currTemplate = dmb.encounter.GetCreatureTemplate(i);
                let childCreatures = creatures.filter(c => c.TemplateName == currTemplate.GetName());
                for (let j = 0; j < childCreatures.length; j++) {
                    let creature = new dmb.encounter.Creature(currTemplate);
                    creature.NameCount = childCreatures[j].NameCount;
                    creature.Initiative = childCreatures[j].Initiative;
                    creature.Notes = childCreatures[j].Notes;
                    creature.CurrentHP = childCreatures[j].CurrentHP;
                    creature.Id = childCreatures[j].Id;
                    dmb.encounter.AddCreature(creature);
                }
            }
            if (encounterJson.CurrentId != null) {
                dmb.encounter.SetCurrentCreatureById(encounterJson.CurrentId);
                dmb.encounter.FillCreatureDisplayFromCreature(dmb.encounter.GetCurrentCreature());
            }
        }
    })(save = dmb.save || (dmb.save = {}));
})(dmb || (dmb = {}));
$(dmb.save.init);
//# sourceMappingURL=save.js.map