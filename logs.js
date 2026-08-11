const express = require("express");
const router = express.Router();
const fileService = require("../services/fileService");

router.get("/", async (req, res) => {
  try {
    const files = await fileService.listLogFiles();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:fileName", async (req, res) => {
  try {
    const content = await fileService.readLog(req.params.fileName);
    res.type("text/plain").send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
