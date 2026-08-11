const { ShareServiceClient } = require("@azure/storage-file-share");
const config = require("../config/azureConfig");

// ICE Task 2: "Log files should be stored using Azure Files."
//
// Azure Files gives us a fully managed SMB/NFS file share in the cloud.
// Unlike Blob Storage, it behaves like a traditional network drive, which
// is a natural fit for append-style application log files that other
// tools (or a mounted drive on a VM) might also need to read.

function getShareServiceClient() {
  return ShareServiceClient.fromConnectionString(config.connectionString);
}

function getDirectoryClient() {
  const shareClient = getShareServiceClient().getShareClient(config.fileShare);
  return shareClient.getDirectoryClient(config.fileShareDirectory);
}

async function ensureShareExists() {
  const shareClient = getShareServiceClient().getShareClient(config.fileShare);
  await shareClient.createIfNotExists();
  const directoryClient = shareClient.getDirectoryClient(config.fileShareDirectory);
  await directoryClient.createIfNotExists();
}

function todayLogFileName() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `app-log-${date}.txt`;
}

async function appendLog(message) {
  const directoryClient = getDirectoryClient();
  const fileName = todayLogFileName();
  const fileClient = directoryClient.getFileClient(fileName);

  const line = `[${new Date().toISOString()}] ${message}\n`;
  const lineBuffer = Buffer.from(line, "utf-8");

  const exists = await fileClient.exists();
  if (!exists) {
    await fileClient.create(lineBuffer.length);
    await fileClient.uploadRange(lineBuffer, 0, lineBuffer.length);
    return fileName;
  }

  // Azure Files requires the file to be resized before appending a range
  const properties = await fileClient.getProperties();
  const currentLength = properties.contentLength || 0;
  const newLength = currentLength + lineBuffer.length;

  await fileClient.resize(newLength);
  await fileClient.uploadRange(lineBuffer, currentLength, lineBuffer.length);
  return fileName;
}

async function readLog(fileName) {
  const directoryClient = getDirectoryClient();
  const targetFile = fileName || todayLogFileName();
  const fileClient = directoryClient.getFileClient(targetFile);

  const exists = await fileClient.exists();
  if (!exists) return "";

  const downloadResponse = await fileClient.download();
  const chunks = [];
  for await (const chunk of downloadResponse.readableStreamBody) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function listLogFiles() {
  const directoryClient = getDirectoryClient();
  const files = [];
  for await (const item of directoryClient.listFilesAndDirectories()) {
    if (item.kind === "file") files.push(item.name);
  }
  return files;
}

module.exports = { ensureShareExists, appendLog, readLog, listLogFiles };
