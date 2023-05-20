﻿using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using DmBuddyMvc.Models;

namespace DmBuddyMvc.Services
{
    public interface IBlobServices
    {
        public Task<string> GetBlobAsJsonAsync(string container, string path, string filename);
        public Task<IResultObject> SaveBlobAsync(string data, string container, string path, string filename);
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
            var blob = _blobServiceClient.GetBlobContainerClient(container).GetBlobClient($"{path}/{filename}");

            if (blob is null)
                return "";

            BlobDownloadResult downloadresult = await blob.DownloadContentAsync();
            return downloadresult.Content.ToString();
        }

        public async Task<IResultObject> SaveBlobAsync(string data, string container, string path, string filename)
        {
            try
            {
                var blobcontainer = _blobServiceClient.GetBlobContainerClient(container);
                var blob = blobcontainer.GetBlobClient($"{path}/{filename}");
                await blob.UploadAsync(BinaryData.FromString(data), overwrite: true);
                return ResultObjects.GoodResult();
            }
            catch
            {
                return ResultObjects.BadResult();
            }
        }

    }
}
