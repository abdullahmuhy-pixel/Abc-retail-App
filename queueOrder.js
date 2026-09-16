const { app } = require("@azure/functions");
const { QueueServiceClient } = require("@azure/storage-queue");

// Project 2 - Function C: "Create a function that reads from/writes to
// the Azure queue."
//
// One HTTP-triggered function handling both directions on the same
// "order-processing" queue used by the Project 1 web app:
//   POST -> writes a new transaction message to the queue
//   GET  -> reads (peeks) the current messages waiting on the queue

function getQueueClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
  return queueServiceClient.getQueueClient("order-processing");
}

app.http("queueOrder", {
  methods: ["GET", "POST"],
  authLevel: "function",
  route: "queueOrder",
  handler: async (request, context) => {
    const queueClient = getQueueClient();
    await queueClient.createIfNotExists();

    try {
      if (request.method === "POST") {
        // ---- WRITE to the queue ----
        const body = await request.json();
        const message = {
          eventType: "OrderPlaced",
          payload: body,
          timestamp: new Date().toISOString(),
        };
        const encoded = Buffer.from(JSON.stringify(message)).toString("base64");
        const result = await queueClient.sendMessage(encoded);
        context.log(`Wrote message ${result.messageId} to order-processing queue`);
        return {
          status: 201,
          jsonBody: { message: "Transaction written to Azure Queue Storage", messageId: result.messageId },
        };
      }

      // ---- READ from the queue ----
      const response = await queueClient.peekMessages({ numberOfMessages: 10 });
      const messages = response.peekedMessageItems.map((m) => ({
        messageId: m.messageId,
        insertedOn: m.insertedOn,
        content: JSON.parse(Buffer.from(m.messageText, "base64").toString("utf-8")),
      }));
      context.log(`Read ${messages.length} message(s) from order-processing queue`);
      return { status: 200, jsonBody: { messages } };
    } catch (error) {
      context.error("queueOrder failed:", error.message);
      return { status: 500, jsonBody: { error: error.message } };
    }
  },
});
