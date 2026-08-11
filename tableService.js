const { TableClient } = require("@azure/data-tables");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/azureConfig");

// ICE Task 1: "Store customer profiles and product related information
// using Azure Tables."
//
// Azure Table Storage is a NoSQL key-value store. Every entity needs a
// partitionKey (used for grouping/scaling) and a rowKey (unique id within
// the partition). We use a single partition ("Customer" / "Product") since
// ABC Retail's data volumes fit comfortably within one partition for this
// assessment, and a generated UUID as the rowKey.

function getCustomersClient() {
  const client = TableClient.fromConnectionString(
    config.connectionString,
    config.customersTable
  );
  return client;
}

function getProductsClient() {
  const client = TableClient.fromConnectionString(
    config.connectionString,
    config.productsTable
  );
  return client;
}

async function ensureTablesExist() {
  await getCustomersClient().createTable();
  await getProductsClient().createTable();
}

// ---------- Customers ----------

async function addCustomer({ fullName, email, phone, address }) {
  const client = getCustomersClient();
  const entity = {
    partitionKey: "Customer",
    rowKey: uuidv4(),
    fullName,
    email,
    phone,
    address,
    createdAt: new Date().toISOString(),
  };
  await client.createEntity(entity);
  return entity;
}

async function listCustomers() {
  const client = getCustomersClient();
  const customers = [];
  for await (const entity of client.listEntities()) {
    customers.push(entity);
  }
  return customers;
}

// ---------- Products ----------

async function addProduct({ name, description, price, category, imageUrl }) {
  const client = getProductsClient();
  const entity = {
    partitionKey: "Product",
    rowKey: uuidv4(),
    name,
    description,
    price: Number(price),
    category,
    imageUrl: imageUrl || "",
    createdAt: new Date().toISOString(),
  };
  await client.createEntity(entity);
  return entity;
}

async function listProducts() {
  const client = getProductsClient();
  const products = [];
  for await (const entity of client.listEntities()) {
    products.push(entity);
  }
  return products;
}

module.exports = {
  ensureTablesExist,
  addCustomer,
  listCustomers,
  addProduct,
  listProducts,
};
