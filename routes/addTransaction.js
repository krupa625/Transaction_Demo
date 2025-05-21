const express = require("express");
const router = express.Router();
const { transferFunds } = require("../controller/transactionAdd");

router.post("/add-transaction", transferFunds);

module.exports = router;
