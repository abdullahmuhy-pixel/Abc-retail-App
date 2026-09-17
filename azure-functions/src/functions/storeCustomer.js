const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");

// Project 2 - Function A: "Create a function that stores information in
// Azure tables."
//
// HTTP-triggered function. POST a JSON body describing a customer, and
// this function writes it as a new entity into the "Customers" Azure
// Table, reusing the same table the Project 1 web app already writes to.

app.http("storeCustomer", {
  methods: ["POST"],
  authLevel: "function",
  route: "storeCustomer",
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { fullName, email, phone, address } = body;

      if (!fullName || !email) {
        return {
          status: 400,
          jsonBody: { error: "fullName and email are required" },
        };
      }

      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const tableClient = TableClient.fromConnectionString(
        connectionString,
        "Customers"
      );
      await tableClient.createTable(); // no-op if it already exists

      const entity = {
        partitionKey: "Customer",
        rowKey: uuidv4(),
        fullName,
        email,
        phone: phone || "",
        address: address || "",
        createdAt: new Date().toISOString(),
        source: "AzureFunction",
      };

      await tableClient.createEntity(entity);
      context.log(`Stored customer entity ${entity.rowKey} in Azure Table Storage`);

      return {
        status: 201,
        jsonBody: { message: "Customer stored in Azure Table Storage", entity },
      };
    } catch (error) {
      context.error("storeCustomer failed:", error.message);
      return { status: 500, jsonBody: { error: error.message } };
    }
  },
});
