const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");

// Project 2 - Function B: "Create a function that writes to Azure blob
// storage."
//
// HTTP-triggered function. POST a JSON body { "imageName": "...",
// "imageBase64": "..." } and this function decodes and uploads it to the
// same "product-images" Blob container the Project 1 web app uses.

app.http("uploadProductImage", {
  methods: ["POST"],
  authLevel: "function",
  route: "uploadProductImage",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { imageName, imageBase64, contentType } = body;

      if (!imageName || !imageBase64) {
        return {
          status: 400,
          jsonBody: { error: "imageName and imageBase64 are required" },
        };
      }

      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient("product-images");
      await containerClient.createIfNotExists({ access: "blob" });

      const blobName = `${Date.now()}-${imageName.replace(/\s+/g, "_")}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const buffer = Buffer.from(imageBase64, "base64");

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType || "image/jpeg" },
      });

      context.log(`Uploaded blob ${blobName} to product-images container`);

      return {
        status: 201,
        jsonBody: { message: "Image uploaded to Azure Blob Storage", url: blockBlobClient.url },
      };
    } catch (error) {
      context.error("uploadProductImage failed:", error.message);
      return { status: 500, jsonBody: { error: error.message } };
    }
  },
});
