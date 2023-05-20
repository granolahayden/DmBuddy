using DmBuddyMvc.Helpers;
using DmBuddyMvc.Models;
using System.Text.Json;

namespace DmBuddyMvc.Services
{
    public class EncounterServices
    {
        private readonly IBlobServices _blobservices;
        private const string ENCOUNTERCONTAINER = "encounter";
        public EncounterServices(IBlobServices blobservices)
        {
            _blobservices = blobservices;
        }

        public async Task<string> LoadEncounterAsync(string username, string encountername)
        {
            return await _blobservices.GetBlobAsJsonAsync(ENCOUNTERCONTAINER, username, encountername.Json());
        }

        public async Task<IResultObject> CreateEncounterAsync(string username, string encountername)
        {
            return await _blobservices.SaveBlobAsync("", ENCOUNTERCONTAINER, username, encountername.Json());
        }

        public async Task<IResultObject> SaveEncounterAsync(EncounterDTO encounter, string username, string encountername)
        {
            string encounterjson = JsonSerializer.Serialize(encounter);
            return await _blobservices.SaveBlobAsync(encounterjson, ENCOUNTERCONTAINER, username, encountername.Json());
        }
    }
}
