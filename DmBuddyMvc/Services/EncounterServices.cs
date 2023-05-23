using DmBuddyMvc.Helpers;
using DmBuddyMvc.Models;
using System.Text.Json;

namespace DmBuddyMvc.Services
{
	public class EncounterServices
	{
		private readonly IBlobServices _blobservices;
		private const string ENCOUNTERCONTAINER = "encounter";
		private const string CREATUREFILE = "creaturedata.json";
		private const string TEMPLATEFILE = "creaturetemplatedata.json";
		public static int MAXSAVES = 3;
		public EncounterServices(IBlobServices blobservices)
		{
			_blobservices = blobservices;
		}

		public async Task<EncounterDTO> LoadEncounterAsync(Guid loginid, string encountername)
		{
			var creaturedatastring = await _blobservices.GetBlobAsJsonAsync(ENCOUNTERCONTAINER, $"{loginid}/{encountername}", CREATUREFILE);
			var creaturedata = string.IsNullOrEmpty(creaturedatastring) ? null : JsonSerializer.Deserialize<CreatureData>(creaturedatastring);

			var creaturetemplatestring = await _blobservices.GetBlobAsJsonAsync(ENCOUNTERCONTAINER, $"{loginid}/{encountername}", TEMPLATEFILE);
			var creaturetemplatedata = string.IsNullOrEmpty(creaturetemplatestring) ? null : JsonSerializer.Deserialize<CreatureTemplateData>(creaturetemplatestring);

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
			var creaturedataresult = await _blobservices.SaveBlobAsync("", ENCOUNTERCONTAINER, $"{loginid}/{encountername}", CREATUREFILE);
			var templatedataresult = await _blobservices.SaveBlobAsync("", ENCOUNTERCONTAINER, $"{loginid}/{encountername}", TEMPLATEFILE);
			return creaturedataresult.IsSuccess && templatedataresult.IsSuccess ? ResultObjects.GoodResult() : ResultObjects.BadResult();
		}

		public async Task<IResultObject> SaveEncounterAsync(Guid loginid, EncounterDTO encounter)
		{
			string encounterjson = JsonSerializer.Serialize(encounter);
			return await _blobservices.SaveBlobAsync(encounterjson, ENCOUNTERCONTAINER, loginid.ToString(), encounter.Name.Json());
		}

		public async Task<IResultObject> SaveCreatureDataAsync(Guid loginid, string encountername, CreatureData creaturedata)
		{
			string creaturejson = JsonSerializer.Serialize(creaturedata);
			return await _blobservices.SaveBlobAsync(creaturejson, ENCOUNTERCONTAINER, $"{loginid}/{encountername}", CREATUREFILE);
		}

		public async Task<IResultObject> SaveCreatureTemplateDataAsync(Guid loginid, string encountername, CreatureTemplateData templatedata)
		{
			string creaturejson = JsonSerializer.Serialize(templatedata);
			return await _blobservices.SaveBlobAsync(creaturejson, ENCOUNTERCONTAINER, $"{loginid}/{encountername}", TEMPLATEFILE);
		}

		public async Task<List<string>> GetEncounterListAsync(Guid loginid)
		{
			var encounters = await _blobservices.GetListOfFilesAsync(ENCOUNTERCONTAINER, loginid.ToString());
			return encounters;
		}

		public async Task<IResultObject> DeleteEncounterAsync(Guid loginid, string encountername)
		{
			var creatureresult = await _blobservices.DeleteBlobAsync(ENCOUNTERCONTAINER, $"{loginid}/{encountername}", CREATUREFILE);
			var templateresult = await _blobservices.DeleteBlobAsync(ENCOUNTERCONTAINER, $"{loginid}/{encountername}", TEMPLATEFILE);
			return creatureresult.IsSuccess && templateresult.IsSuccess ? ResultObjects.GoodResult() : ResultObjects.BadResult();
		}
	}
}
