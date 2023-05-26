namespace dmb.save {

    let SaveLock: boolean;
    let EncounterName: string;

    export function CanSave(): boolean {
        return SaveLock == false && EncounterName != null;
    }
    export function init() {
        SaveLock = false;
        EncounterName = document.getElementById("encounterName")?.innerHTML != undefined ? document.getElementById("encounterName")?.innerHTML : null;
        if (CanSave()) {
            LoadEncounter();
        }
    }

    export function LockSave() {
        SaveLock = true;
    }
    export function UnlockSave() {
        SaveLock = false;
    }

    export function SaveCreatureData(): void{
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
        }

        $.post("/Encounter/SaveCreatureData", {
            __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
            encountername: EncounterName,
            creaturedata: creaturesjson
        });
    }

    export function SaveCreatureTemplateData(): void {
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
        }

        $.post("/Encounter/SaveCreatureTemplateData", {
            __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
            encountername: EncounterName,
            creaturetemplatedata: templatesjson
        });
    }

    export async function LoadEncounter() {
        if (!CanSave())
            return;

        var result = await fetch("/Encounter/LoadEncounter/" + EncounterName, {
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
        let creatures = encounterJson.Creatures
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
}
$(dmb.save.init)