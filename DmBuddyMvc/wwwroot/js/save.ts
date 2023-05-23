namespace dmb.save {
    export function init() {
        if (document.getElementById("encounterName")?.innerHTML == undefined) {
            return;
        }
        LoadEncounter();
        //setInterval(SaveEncounter, 30000);
    }

    export function SaveEncounter() {
        const encounterName = document.getElementById("encounterName")?.innerHTML != undefined ? document.getElementById("encounterName")?.innerHTML : null;
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
        }

        $.post("/Encounter/SaveEncounter", {
            __RequestVerificationToken: $('input[name=__RequestVerificationToken]').val(),
            encounter: encounterjson
        });
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
                //'Content-Type': 'application/json'
            },
            method: 'get'
        }).then(response => response.json())
        //.then(response => {
        //    if (response != "")
        //        PopulateEncounterFromJson(JSON.parse(response));
        ;
            

                   
        //.then(response => response.value)
        //.then(response => {
        //    if (response != "")
        //        PopulateEncounterFromJson(JSON.parse(response));
        //})
        //.catch();

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

    const getSizeInBytes = obj => {
        let str = null;
        if (typeof obj === 'string') {
            // If obj is a string, then use it
            str = obj;
        } else {
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
}
$(dmb.save.init)