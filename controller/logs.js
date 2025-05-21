const Transaction = require("../models/transaction");
const { STATUS_CODES } = require("../utils/statuscode");
const getPassbook = async (req, res) => {
  const { userId } = req.params;
  const transactions = await Transaction.find({ userId }).sort({
    createdAt: -1,
  });
  res.status(STATUS_CODES.OK).json(transactions);
};

module.exports = { getPassbook };
