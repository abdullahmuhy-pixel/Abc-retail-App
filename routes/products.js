const express = require("express");
const multer = require("multer");
const router = express.Router();

const tableService = require("../services/tableService");
const blobService = require("../services/blobService");
const queueService = require("../services/queueService");
const fileService = require("../services/fileService");

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products  (multipart/form-data with an "image" file field)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      imageUrl = await blobService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // ICE Task 2 requirement: image processing events go on the queue
      await queueService.enqueueMessage("ImageUploaded", {
        imageName: req.file.originalname,
        blobUrl: imageUrl,
      });
    }

    const product = await tableService.addProduct({
      ...req.body,
      imageUrl,
    });

    await fileService.appendLog(`Product created: ${product.name}`);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await tableService.listProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/images", async (req, res) => {
  try {
    const images = await blobService.listImages();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
