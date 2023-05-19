using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace DmBuddyMvc.Services
{
    public interface IBlobServices
    {
        public Task<string> GetBlobAsJsonAsync(string container, string path, string filename);
        public Task SaveBlobAsync(string container, string path, string filename);
    }

    public class BlobServices : IBlobServices
    {
        private readonly BlobServiceClient _blobServiceClient;

        public BlobServices(BlobServiceClient blobServiceClient)
        {
            _blobServiceClient = blobServiceClient;
        }

        public async Task<string> GetBlobAsJsonAsync(string container, string path, string filename)
        {
            var encounterfile = _blobServiceClient.GetBlobContainerClient(container).GetBlobClient($"{path}/{filename}");

            if (encounterfile is null)
                return "";

            BlobDownloadResult downloadresult = await encounterfile.DownloadContentAsync();
            return downloadresult.Content.ToString();
        }

        public async Task SaveBlobAsync(string container, string path, string filename) => throw new NotImplementedException();

    }
}
