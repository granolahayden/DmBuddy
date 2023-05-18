var dmb;
(function (dmb) {
    var save;
    (function (save) {
        function SaveEncounter() {
            var _a;
            const encounterName = (_a = document.getElementById("encounterName")) === null || _a === void 0 ? void 0 : _a.innerHTML;
            const currentIndex = GetCurrentIndex();
            $.post("/Encounter/SaveEncounter", {
                encounter: {
                    Name: encounterName,
                    CurrentIndex: currentIndex
                }
            });
        }
        save.SaveEncounter = SaveEncounter;
        function GetCurrentIndex() {
            var _a;
            const currentcreature = dmb.encounter.GetCurrentCreature();
            return (_a = currentcreature === null || currentcreature === void 0 ? void 0 : currentcreature.CreatureIndex) !== null && _a !== void 0 ? _a : 0;
        }
    })(save = dmb.save || (dmb.save = {}));
})(dmb || (dmb = {}));
//# sourceMappingURL=save.js.map