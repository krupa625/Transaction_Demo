const getLogsRoute = require("../routes/getLogs");
const createUserRoute = require("../routes/createUser");
const addTransactionRoute = require("../routes/addTransaction");
const express = require("express");
const router = express.Router();

router.use("/", getLogsRoute, createUserRoute, addTransactionRoute);

module.exports = router;
