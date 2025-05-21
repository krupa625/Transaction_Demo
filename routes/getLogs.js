const express = require("express");
const router = express.Router();
const { logsEntry } = require("../controller/logs");

router.get("/user/:userId/logs", logsEntry);

module.exports = router;
