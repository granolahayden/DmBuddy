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
            return await _blobservices.GetBlobAsJsonAsync(ENCOUNTERCONTAINER, username, $"{encountername}.json");
        }
    }
}
