const express = require("express");
const router = express.Router();
const { transactionEntry } = require("../controller/transactionAdd");

router.post("/add-transaction", transactionEntry);

module.exports = router;
