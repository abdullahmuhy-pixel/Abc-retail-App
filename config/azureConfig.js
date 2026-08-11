require("dotenv").config();

// Central place that reads all Azure-related settings from environment
// variables. Every service file (table/blob/queue/file) imports this
// instead of reading process.env directly.
module.exports = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  customersTable: process.env.CUSTOMERS_TABLE || "Customers",
  productsTable: process.env.PRODUCTS_TABLE || "Products",
  blobContainer: process.env.BLOB_CONTAINER || "product-images",
  ordersQueue: process.env.ORDERS_QUEUE || "order-processing",
  fileShare: process.env.FILE_SHARE || "abcretaillogs",
  fileShareDirectory: process.env.FILE_SHARE_DIRECTORY || "logs",
  port: process.env.PORT || 3000,
};
