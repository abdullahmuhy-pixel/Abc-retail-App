const { app } = require("@azure/functions");
const { ShareServiceClient } = require("@azure/storage-file-share");

// Project 2 - Function D: "Create a function that sends a file to Azure
// Files."
//
// HTTP-triggered function. POST a JSON body { "message": "..." } and
// this function appends a timestamped line to the same daily log file
// the Project 1 web app writes to on the "abcretaillogs/logs" File share.

app.http("writeLogFile", {
  methods: ["POST"],
  authLevel: "function",
  route: "writeLogFile",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { message } = body;

      if (!message) {
        return { status: 400, jsonBody: { error: "message is required" } };
      }

      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const shareServiceClient = ShareServiceClient.fromConnectionString(connectionString);
      const shareClient = shareServiceClient.getShareClient("abcretaillogs");
      await shareClient.createIfNotExists();
      const directoryClient = shareClient.getDirectoryClient("logs");
      await directoryClient.createIfNotExists();

      const fileName = `app-log-${new Date().toISOString().slice(0, 10)}.txt`;
      const fileClient = directoryClient.getFileClient(fileName);
      const line = `[${new Date().toISOString()}] (Function) ${message}\n`;
      const lineBuffer = Buffer.from(line, "utf-8");

      const exists = await fileClient.exists();
      if (!exists) {
        await fileClient.create(lineBuffer.length);
        await fileClient.uploadRange(lineBuffer, 0, lineBuffer.length);
      } else {
        const { contentLength } = await fileClient.getProperties();
        await fileClient.resize(contentLength + lineBuffer.length);
        await fileClient.uploadRange(lineBuffer, contentLength, lineBuffer.length);
      }

      context.log(`Appended entry to ${fileName} on Azure Files`);

      return {
        status: 201,
        jsonBody: { message: "Entry written to Azure Files", fileName },
      };
    } catch (error) {
      context.error("writeLogFile failed:", error.message);
      return { status: 500, jsonBody: { error: error.message } };
    }
  },
});
