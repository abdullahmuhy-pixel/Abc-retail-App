const express = require("express");
const router = express.Router();
const tableService = require("../services/tableService");
const fileService = require("../services/fileService");

router.post("/", async (req, res) => {
  try {
    const customer = await tableService.addCustomer(req.body);
    await fileService.appendLog(`Customer created: ${customer.email}`);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const customers = await tableService.listCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
