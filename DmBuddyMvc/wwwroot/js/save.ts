namespace dmb.save {
    export function CanSave(): boolean {
        return document.getElementById("encounterName")?.innerHTML != undefined;
    }
    export function init() {
        if (CanSave()) {
            LoadEncounter();
        }
    }

    export function SaveCreatureData(): void{
        const encounterName = document.getElementById("encounterName")?.innerHTML != undefined ? document.getElementById("encounterName")?.innerHTML : null;
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
        }

        $.post("/Encounter/SaveCreatureData", {
            __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
            encountername: encounterName,
            creaturedata: creaturesjson
        });
    }

    export function SaveCreatureTemplateData(): void {
        const encounterName = document.getElementById("encounterName")?.innerHTML != undefined ? document.getElementById("encounterName")?.innerHTML : null;
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
        }

        $.post("/Encounter/SaveCreatureTemplateData", {
            __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
            encountername: encounterName,
            creaturetemplatedata: templatesjson
        });
    }

    function GetCurrentId(): number {
        const currentcreature = dmb.encounter.GetCurrentCreature();
        return currentcreature?.Id;
    }


    export async function LoadEncounter() {
        let encounterName = document.getElementById("encounterName")?.innerHTML;
        if (encounterName == undefined)
            return;

        var result = await fetch("/Encounter/LoadEncounter/" + encounterName, {
            headers: {
                'Accept': 'application/json'
            },
            method: 'get'
        }).then(response => response.json())

        if (result != "")
            PopulateEncounterFromJson(JSON.parse(result));
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
$(dmb.save.init)