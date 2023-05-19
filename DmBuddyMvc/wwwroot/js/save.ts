namespace dmb.save {
    export function SaveEncounter() {
        const encounterName = document.getElementById("encounterName")?.innerHTML != undefined ? document.getElementById("encounterName")?.innerHTML : null;

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

    function GetCurrentId(): number {
        const currentcreature = dmb.encounter.GetCurrentCreature();
        return currentcreature?.Id ?? 0;
    }


    export async function LoadEncounter(encounterName: string) {
        var encounterResponse = await fetch("/Encounter/LoadEncounter/" + encounterName);
        var encounterJson = await encounterResponse.json();

        console.log(encounterJson);
    }

}