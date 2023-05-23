using DmBuddyMvc.Helpers;
using DmBuddyMvc.Models;
using System.Text.Json;

namespace DmBuddyMvc.Services
{
	public class EncounterServices
	{
		private readonly IBlobServices _blobservices;
		private const string ENCOUNTERCONTAINER = "encounter";
		public static int MAXSAVES = 3;
		public EncounterServices(IBlobServices blobservices)
		{
			_blobservices = blobservices;
		}

		public async Task<EncounterDTO> LoadEncounterAsync(Guid loginid, string encountername)
		{
			//return await _blobservices.GetBlobAsJsonAsync(ENCOUNTERCONTAINER, loginid.ToString(), encountername.Json());
			var creaturedata = JsonSerializer.Deserialize<CreatureData>(await _blobservices.GetBlobAsJsonAsync(ENCOUNTERCONTAINER, $"{loginid}/{encountername}", "creaturedata.json"));
			var creaturetemplatedata = JsonSerializer.Deserialize<CreatureTemplateData>(await _blobservices.GetBlobAsJsonAsync(ENCOUNTERCONTAINER, $"{loginid}/{encountername}", "creaturetemplatedata.json"));
			var encounterdto = new EncounterDTO
			{
				Name = encountername,
				Creatures = creaturedata?.Creatures ?? new(),
				CurrentId = creaturedata?.CurrentId,
				CreatureTemplates = creaturetemplatedata?.CreatureTemplates ?? new()
			};

			return encounterdto;
		}

		public async Task<IResultObject> CreateEncounterAsync(Guid loginid, string encountername)
		{
			return await _blobservices.SaveBlobAsync("", ENCOUNTERCONTAINER, loginid.ToString(), encountername.Json());
		}

		public async Task<IResultObject> SaveEncounterAsync(Guid loginid, EncounterDTO encounter)
		{
			string encounterjson = JsonSerializer.Serialize(encounter);
			return await _blobservices.SaveBlobAsync(encounterjson, ENCOUNTERCONTAINER, loginid.ToString(), encounter.Name.Json());
		}

		public async Task<IResultObject> SaveCreatureDataAsync(Guid loginid, string encountername, CreatureData creaturedata)
		{
			string creaturejson = JsonSerializer.Serialize(creaturedata);
			return await _blobservices.SaveBlobAsync(creaturejson, ENCOUNTERCONTAINER, $"{loginid}/{encountername}", "creaturedata.json");
		}

		public async Task<IResultObject> SaveCreatureTemplateDataAsync(Guid loginid, string encountername, CreatureTemplateData templatedata)
		{
			string creaturejson = JsonSerializer.Serialize(templatedata);
			return await _blobservices.SaveBlobAsync(creaturejson, ENCOUNTERCONTAINER, $"{loginid}/{encountername}", "creaturetemplatedata.json");
		}

		public async Task<List<string>> GetEncounterListAsync(Guid loginid)
		{
			var encounters = await _blobservices.GetListOfFilesAsync(ENCOUNTERCONTAINER, loginid.ToString());
			return encounters.Select(e => e[..^5]).ToList();
		}

		public async Task<IResultObject> DeleteEncounterAsync(Guid loginid, string encountername)
		{
			return await _blobservices.DeleteBlobAsync(ENCOUNTERCONTAINER, loginid.ToString(), encountername.Json());
		}
	}
}
