const Transaction = require("../models/transaction");
const { STATUS_CODES } = require("../utils/statuscode");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const transferFunds = async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromUser = await User.findById(fromUserId).session(session);
    const toUser = await User.findById(toUserId).session(session);

    if (!fromUser || !toUser) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(STATUS_CODES.NotFound)
        .send("One or both users not found");
    }

    if (fromUser.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(STATUS_CODES.BadRequest).send("Insufficient balance");
    }

    fromUser.balance -= amount;

    toUser.balance += amount;

    const debitTransaction = new Transaction({
      userId: fromUserId,
      type: "debit",
      amount,
      description: `Transferred to user ${fromUser.name}`,
      relatedUserId: fromUserId,
    });

    const creditTransaction = new Transaction({
      userId: toUserId,
      type: "credit",
      amount,
      description: `Received from user ${toUser.name}`,
      relatedUserId: toUserId,
    });

    await fromUser.save({ session });
    await toUser.save({ session });
    await debitTransaction.save({ session });
    await creditTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(STATUS_CODES.OK).send("Transfer successful");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(STATUS_CODES.InternalServerError)
      .send("Transaction failed: " + err.message);
  }
};
module.exports = { transferFunds };
