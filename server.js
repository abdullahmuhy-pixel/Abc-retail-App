const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config/azureConfig");

const tableService = require("./services/tableService");
const blobService = require("./services/blobService");
const queueService = require("./services/queueService");
const fileService = require("./services/fileService");

const customersRouter = require("./routes/customers");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const logsRouter = require("./routes/logs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/customers", customersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/logs", logsRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

async function bootstrap() {
  if (!config.connectionString) {
    console.error(
      "AZURE_STORAGE_CONNECTION_STRING is not set. Copy .env.example to .env and fill it in."
    );
    process.exit(1);
  }

  // Create every Azure resource the app depends on if it doesn't exist yet.
  // ICE Task 1: Tables + Blob container
  await tableService.ensureTablesExist();
  await blobService.ensureContainerExists();
  // ICE Task 2: Queue + File share
  await queueService.ensureQueueExists();
  await fileService.ensureShareExists();

  console.log("Azure Table, Blob, Queue and File resources are ready.");

  app.listen(config.port, () => {
    console.log(`ABC Retail app running at http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start app:", err.message);
  process.exit(1);
});
