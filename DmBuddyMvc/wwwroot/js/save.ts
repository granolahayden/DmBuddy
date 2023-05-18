namespace dmb.save {
    export function SaveEncounter() {
        const encounterName = document.getElementById("encounterName")?.innerHTML;
        const currentIndex = GetCurrentIndex();

        $.post("/Encounter/SaveEncounter", {
            encounter: {
                Name: encounterName,
                CurrentIndex: currentIndex
            }
        });
    }

    function GetCurrentIndex(): number {
        const currentcreature = dmb.encounter.GetCurrentCreature();
        return currentcreature?.CreatureIndex ?? 0;
    }
}