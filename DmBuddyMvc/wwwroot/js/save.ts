namespace dmb.save {
    export function SaveEncounter() {
        let currentcreature = dmb.encounter.GetCurrentCreature();
        if (currentcreature != null)
            dmb.encounter.SaveCreatureNotes(currentcreature);

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

        $.post("/Encounter/SaveEncounter", {
            encounter: {
                Name: encounterName,
                CurrentId: GetCurrentId(),
                CreatureTemplates: creatureTemplates,
                Creatures: creatures
            }
        });
    }

    function GetCurrentId(): number {
        const currentcreature = dmb.encounter.GetCurrentCreature();
        return currentcreature?.Id;
    }


    export async function LoadEncounter(encounterName: string) {
        await fetch("/Encounter/LoadEncounter/" + encounterName, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'get'
        })
        .then(response => response.json())
            .then(response => {
                PopulateEncounterFromJson(JSON.parse(response.value));
        })
        .catch();
    }

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

}