const Transaction = require("../models/transaction");
const { STATUS_CODES } = require("../utils/statuscode");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const transferFunds = async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  // 📌 Scenario 1: Single session transaction (standard flow)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromUser = await User.findById(fromUserId).session(session);
    const toUser = await User.findById(toUserId).session(session);

    if (!fromUser || !toUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(STATUS_CODES.NotFound).send("Users not found");
    }

    if (fromUser.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(STATUS_CODES.BadRequest).send("Insufficient balance");
    }

    fromUser.balance -= amount;
    toUser.balance += amount;

    await fromUser.save({ session });
    await toUser.save({ session });

    // 📌 Scenario 2: Before commit — Read user outside session (should show old balance)
    // const fromUserOutside = await User.findById(fromUserId);
    // console.log("From User (outside session before commit):", fromUserOutside.balance);

    // 📌 Scenario 3: Before commit — Read user inside session (should show updated balance)
    // const fromUserInside = await User.findById(fromUserId).session(session);
    // console.log("From User (inside session before commit):", fromUserInside.balance);

    // 📌 Scenario 4: Create another session in parallel and try reading same user (should show old balance)
    // const session2 = await mongoose.startSession();
    // const fromUserInSession2 = await User.findById(fromUserId).session(session2);
    // console.log("From User (inside session2 before commit):", fromUserInSession2.balance);
    // await session2.endSession();

    await session.commitTransaction();
    session.endSession();

    // 📌 Scenario 5: After commit — Read user outside (should show updated balance)
    // const fromUserAfterCommit = await User.findById(fromUserId);
    // console.log("From User (outside after commit):", fromUserAfterCommit.balance);

    res.send("Transaction done");

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log("Transaction failed:", err.message);
    res.status(STATUS_CODES.InternalServerError).send("Transaction failed");
  }

  // 📌 Scenario 6: Transaction abort test
  // const sessionAbort = await mongoose.startSession();
  // sessionAbort.startTransaction();
  // const userAbort = await User.findById(fromUserId).session(sessionAbort);
  // userAbort.balance -= 50;
  // await userAbort.save({ session: sessionAbort });
  // await sessionAbort.abortTransaction();
  // sessionAbort.endSession();
  // const afterAbortCheck = await User.findById(fromUserId);
  // console.log("After Abort Transaction, From User balance:", afterAbortCheck.balance);

  // 📌 Scenario 7: Two sessions, one commit one abort
  // const sessionA = await mongoose.startSession();
  // const sessionB = await mongoose.startSession();
  // sessionA.startTransaction();
  // sessionB.startTransaction();
  // const userA = await User.findById(fromUserId).session(sessionA);
  // const userB = await User.findById(fromUserId).session(sessionB);
  // userA.balance -= 20;
  // userB.balance -= 30;
  // await userA.save({ session: sessionA });
  // await userB.save({ session: sessionB });
  // await sessionA.commitTransaction();
  // await sessionB.abortTransaction();
  // sessionA.endSession();
  // sessionB.endSession();
  // const finalUserCheck = await User.findById(fromUserId);
  // console.log("After Two sessions (one commit, one abort):", finalUserCheck.balance);

};

module.exports = { transferFunds };
