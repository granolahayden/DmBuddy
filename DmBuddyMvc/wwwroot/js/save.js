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
        function SaveEncounter() {
            var _a, _b;
            const encounterName = ((_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML) != undefined ? (_b = document.getElementById("encounterName")) === null || _b === void 0 ? void 0 : _b.innerHTML : null;
            let creatureTemplates = [];
            let currentCreatureTemplate = dmb.encounter.GetCreatureTemplate(0);
            for (let i = 1; currentCreatureTemplate != null; i++) {
                creatureTemplates.push({
                    Name: currentCreatureTemplate.Name,
                    NameCount: currentCreatureTemplate.NameCount,
                    MaxHP: currentCreatureTemplate.MaxHP,
                    AC: currentCreatureTemplate.AC,
                    DefaultNotes: currentCreatureTemplate.DefaultNotes,
                    ImageData: currentCreatureTemplate.PictureData
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
            let encounter = {
                Name: encounterName,
                CurrentId: GetCurrentId(),
                CreatureTemplates: creatureTemplates,
                Creatures: creatures
            };
            $.post("/Encounter/SaveEncounter", {
                encounter: {
                    Name: encounterName,
                    CurrentId: GetCurrentId(),
                    CreatureTemplates: creatureTemplates,
                    Creatures: creatures
                }
            }).then(function (data) { console.log(data); });
        }
        save.SaveEncounter = SaveEncounter;
        function GetCurrentId() {
            var _a;
            const currentcreature = dmb.encounter.GetCurrentCreature();
            return (_a = currentcreature === null || currentcreature === void 0 ? void 0 : currentcreature.Id) !== null && _a !== void 0 ? _a : 0;
        }
        function LoadEncounter(encounterName) {
            return __awaiter(this, void 0, void 0, function* () {
                var encounterResponse = yield fetch("/Encounter/LoadEncounter/" + encounterName);
                var encounterJson = yield encounterResponse.json();
                console.log(encounterJson);
            });
        }
        save.LoadEncounter = LoadEncounter;
    })(save = dmb.save || (dmb.save = {}));
})(dmb || (dmb = {}));
//# sourceMappingURL=save.js.map