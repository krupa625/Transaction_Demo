const Transaction = require("../models/transaction");
const { STATUS_CODES } = require("../utils/statuscode");
const User = require("../models/user");

const transactionEntry = async (req, res) => {
  const { userId, type, amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(STATUS_CODES.NotFound).send("User not found");

    if (type === "deposit") {
      user.balance += amount;
    } else if (type === "withdrawal") {
      if (user.balance < amount) {
        return res.status(STATUS_CODES.BadRequest).send("Insufficient balance");
      }
      user.balance -= amount;
    } else {
      return res
        .status(STATUS_CODES.BadRequest)
        .send("Invalid transaction type");
    }

    const transaction = new Transaction({ userId, type, amount });
    await transaction.save();
    await user.save();

    res.status(STATUS_CODES.OK).send("Transaction added successfully");
  } catch (err) {
    res.status(STATUS_CODES.InternalServerError).send("Error: " + err.message);
  }
};

module.exports = { transactionEntry };
