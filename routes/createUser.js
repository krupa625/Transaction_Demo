const express = require("express");
const router = express.Router();
const { userCreate } = require("../controller/createuser");

router.post("/create-user", userCreate);

module.exports = router;
