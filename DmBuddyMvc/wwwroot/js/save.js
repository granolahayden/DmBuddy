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
        function CanSave() {
            var _a;
            return ((_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML) != undefined;
        }
        save.CanSave = CanSave;
        function init() {
            if (CanSave()) {
                LoadEncounter();
            }
        }
        save.init = init;
        function SaveCreatureData() {
            var _a, _b;
            const encounterName = ((_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML) != undefined ? (_b = document.getElementById("encounterName")) === null || _b === void 0 ? void 0 : _b.innerHTML : null;
            if (encounterName == null)
                return;
            let creatures = [];
            let currentCreature = dmb.encounter.GetCreature(0);
            for (let i = 1; currentCreature != null; i++) {
                creatures.push({
                    Id: currentCreature.Id,
                    NameCount: currentCreature.NameCount,
                    CreatureIndex: currentCreature.CreatureIndex,
                    Initiative: currentCreature.Initiative,
                    CurrentHP: currentCreature.CurrentHP,
                    Notes: currentCreature.Notes
                });
                currentCreature = dmb.encounter.GetCreature(i);
            }
            let creaturesjson = {
                CurrentId: GetCurrentId(),
                Creatures: creatures
            };
            $.post("/Encounter/SaveCreatureData", {
                __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
                encountername: encounterName,
                creaturedata: creaturesjson
            });
        }
        save.SaveCreatureData = SaveCreatureData;
        function SaveCreatureTemplateData() {
            var _a, _b;
            const encounterName = ((_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML) != undefined ? (_b = document.getElementById("encounterName")) === null || _b === void 0 ? void 0 : _b.innerHTML : null;
            if (encounterName == null)
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
                encountername: encounterName,
                creaturetemplatedata: templatesjson
            });
        }
        save.SaveCreatureTemplateData = SaveCreatureTemplateData;
        function GetCurrentId() {
            const currentcreature = dmb.encounter.GetCurrentCreature();
            return currentcreature === null || currentcreature === void 0 ? void 0 : currentcreature.Id;
        }
        function LoadEncounter() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                let encounterName = (_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML;
                if (encounterName == undefined)
                    return;
                var result = yield fetch("/Encounter/LoadEncounter/" + encounterName, {
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
            for (let i = 0; i < creatureTemplates.length; i++) {
                dmb.encounter.CreateTemplate(creatureTemplates[i].Name, creatureTemplates[i].AC, creatureTemplates[i].MaxHP, creatureTemplates[i].DefaultNotes, creatureTemplates[i].NameCount, creatureTemplates[i].PictureData);
            }
            let creatures = encounterJson.Creatures;
            for (let i = 0; i < creatures.length; i++) {
                let templateindex = Number(creatures[i].CreatureIndex);
                let creature = new dmb.encounter.Creature(dmb.encounter.GetCreatureTemplate(templateindex), templateindex);
                creature.NameCount = creatures[i].NameCount;
                creature.Initiative = creatures[i].Initiative;
                creature.Notes = creatures[i].Notes;
                creature.CurrentHP = creatures[i].CurrentHP;
                creature.Id = creatures[i].Id;
                dmb.encounter.AddCreature(creature);
            }
            if (encounterJson.CurrentId != null) {
                document.getElementById("creatureDisplayId").innerHTML = encounterJson.CurrentId;
                dmb.encounter.FillCreatureDisplayFromCreature(dmb.encounter.GetCurrentCreature());
            }
        }
    })(save = dmb.save || (dmb.save = {}));
})(dmb || (dmb = {}));
$(dmb.save.init);
//# sourceMappingURL=save.js.map