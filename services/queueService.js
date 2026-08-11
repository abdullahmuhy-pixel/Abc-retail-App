const { QueueClient } = require("@azure/storage-queue");
const config = require("../config/azureConfig");

// ICE Task 2: "Details relating to processing of orders and inventory
// management should be stored in Azure Queues. An example would be
// Uploading image 'imageName', 'Processing order', etc."
//
// Azure Queue Storage decouples the web front-end from slower background
// work (e.g. updating inventory, generating invoices). The web app writes
// a small JSON message describing the event; a worker process (or the
// same app, polling) reads and processes it later.

function getQueueClient() {
  return QueueClient.fromConnectionString(
    config.connectionString,
    config.ordersQueue
  );
}

async function ensureQueueExists() {
  await getQueueClient().createIfNotExists();
}

async function enqueueMessage(eventType, payload) {
  const client = getQueueClient();
  const message = {
    eventType, // e.g. "OrderPlaced", "ImageUploaded", "InventoryUpdate"
    payload,
    timestamp: new Date().toISOString(),
  };
  // Queue messages must be base64-encoded text
  const encoded = Buffer.from(JSON.stringify(message)).toString("base64");
  const result = await client.sendMessage(encoded);
  return { messageId: result.messageId, message };
}

async function peekMessages(maxMessages = 10) {
  const client = getQueueClient();
  const response = await client.peekMessages({ numberOfMessages: maxMessages });
  return response.peekedMessageItems.map((m) => ({
    messageId: m.messageId,
    insertedOn: m.insertedOn,
    content: JSON.parse(Buffer.from(m.messageText, "base64").toString("utf-8")),
  }));
}

async function receiveAndProcessMessages(maxMessages = 5) {
  const client = getQueueClient();
  const response = await client.receiveMessages({ numberOfMessages: maxMessages });
  const processed = [];

  for (const m of response.receivedMessageItems) {
    const content = JSON.parse(Buffer.from(m.messageText, "base64").toString("utf-8"));
    // ---- this is where real processing would happen, e.g. ----
    // - update stock levels in the Products table
    // - send a confirmation email
    // - generate an invoice
    processed.push({ messageId: m.messageId, content });

    // Remove from the queue once processed
    await client.deleteMessage(m.messageId, m.popReceipt);
  }
  return processed;
}

module.exports = {
  ensureQueueExists,
  enqueueMessage,
  peekMessages,
  receiveAndProcessMessages,
};
