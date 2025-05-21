const Transaction = require("../models/transaction");
const { STATUS_CODES } = require("../utils/statuscode");

const logsEntry = async (req, res) => {
  const { userId } = req.params;

  try {
    const logs = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(STATUS_CODES.InternalServerError).send("Error: " + err.message);
  }
};

module.exports = { logsEntry };
