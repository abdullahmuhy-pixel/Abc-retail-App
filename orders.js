const express = require("express");
const router = express.Router();
const queueService = require("../services/queueService");
const fileService = require("../services/fileService");

// POST /api/orders  -> places an order (writes a message to the queue)
router.post("/", async (req, res) => {
  try {
    const { customerId, productId, quantity } = req.body;
    const result = await queueService.enqueueMessage("OrderPlaced", {
      customerId,
      productId,
      quantity,
    });
    await fileService.appendLog(
      `Order queued: customer=${customerId} product=${productId} qty=${quantity}`
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/peek -> view what's waiting in the queue (not removed)
router.get("/peek", async (req, res) => {
  try {
    const messages = await queueService.peekMessages();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/process -> simulate a worker processing queued orders
router.post("/process", async (req, res) => {
  try {
    const processed = await queueService.receiveAndProcessMessages();
    for (const item of processed) {
      await fileService.appendLog(`Order processed: ${JSON.stringify(item.content)}`);
    }
    res.json(processed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
