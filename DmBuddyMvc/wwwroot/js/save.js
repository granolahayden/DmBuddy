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
        function init() {
            var _a;
            if (((_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML) == undefined) {
                return;
            }
            LoadEncounter();
            setInterval(SaveEncounter, 30000);
        }
        save.init = init;
        function SaveEncounter() {
            var _a, _b;
            const encounterName = ((_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML) != undefined ? (_b = document.getElementById("encounterName")) === null || _b === void 0 ? void 0 : _b.innerHTML : null;
            if (encounterName == null)
                return;
            let currentcreature = dmb.encounter.GetCurrentCreature();
            if (currentcreature != null)
                dmb.encounter.SaveCreatureNotes(currentcreature);
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
            let encounterjson = {
                Name: encounterName,
                CurrentId: GetCurrentId(),
                CreatureTemplates: creatureTemplates,
                Creatures: creatures
            };
            $.post("/Encounter/SaveEncounter", {
                __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
                encounter: encounterjson
            });
        }
        save.SaveEncounter = SaveEncounter;
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
                yield fetch("/Encounter/LoadEncounter/" + encounterName, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: 'get'
                })
                    .then(response => response.json())
                    .then(response => response.value)
                    .then(response => {
                    if (response != "")
                        PopulateEncounterFromJson(JSON.parse(response));
                })
                    .catch();
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
        const getSizeInBytes = obj => {
            let str = null;
            if (typeof obj === 'string') {
                // If obj is a string, then use it
                str = obj;
            }
            else {
                // Else, make obj into a string
                str = JSON.stringify(obj);
            }
            // Get the length of the Uint8Array
            const bytes = new TextEncoder().encode(str).length;
            return bytes;
        };
        const logSizeInBytes = (description, obj) => {
            const bytes = getSizeInBytes(obj);
            console.log(`${description} is approximately ${bytes} B`);
        };
    })(save = dmb.save || (dmb.save = {}));
})(dmb || (dmb = {}));
$(dmb.save.init);
//# sourceMappingURL=save.js.map