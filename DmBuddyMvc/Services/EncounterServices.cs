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

        public async Task<string> LoadEncounterAsync(Guid loginid, string encountername)
        {
            return await _blobservices.GetBlobAsJsonAsync(ENCOUNTERCONTAINER, loginid.ToString(), encountername.Json());
        }

        public async Task<IResultObject> CreateEncounterAsync(Guid loginid, string encountername)
        {
            return await _blobservices.SaveBlobAsync("", ENCOUNTERCONTAINER, loginid.ToString(), encountername.Json());
        }

        public async Task<IResultObject> SaveEncounterAsync(EncounterDTO encounter, Guid loginid, string encountername)
        {
            string encounterjson = JsonSerializer.Serialize(encounter);
            return await _blobservices.SaveBlobAsync(encounterjson, ENCOUNTERCONTAINER, loginid.ToString(), encountername.Json());
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
