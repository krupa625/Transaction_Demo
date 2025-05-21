const express = require("express");
const router = express.Router();
const { getPassbook } = require("../controller/logs");

router.get("/user/:userId/logs", getPassbook);

module.exports = router;
