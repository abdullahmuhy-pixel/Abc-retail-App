const { BlobServiceClient } = require("@azure/storage-blob");
const config = require("../config/azureConfig");

// ICE Task 1: "Host images and multimedia content using Azure Blob
// Storage." Blob Storage is Azure's object store, ideal for unstructured
// binary data like product photos, videos and documents.

function getContainerClient() {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.connectionString
  );
  return blobServiceClient.getContainerClient(config.blobContainer);
}

async function ensureContainerExists() {
  const containerClient = getContainerClient();
  // "blob" public access lets us hand back a browsable image URL directly
  await containerClient.createIfNotExists({ access: "blob" });
}

async function uploadImage(fileBuffer, originalName, mimeType) {
  const containerClient = getContainerClient();
  const blobName = `${Date.now()}-${originalName.replace(/\s+/g, "_")}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: mimeType },
  });

  return blockBlobClient.url; // public URL we store in the Products table
}

async function listImages() {
  const containerClient = getContainerClient();
  const blobs = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    blobs.push({
      name: blob.name,
      url: containerClient.getBlockBlobClient(blob.name).url,
      lastModified: blob.properties.lastModified,
      sizeBytes: blob.properties.contentLength,
    });
  }
  return blobs;
}

module.exports = { ensureContainerExists, uploadImage, listImages };
