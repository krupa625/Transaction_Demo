const Transaction = require("../models/transaction");
const { STATUS_CODES } = require("../utils/statuscode");
const User = require("../models/user");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const transferFunds = async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  //  Scenario 1: Single session
  const session = await mongoose.startSession();
  session.startTransaction();
  const session_1 = await mongoose.startSession();
  session_1.startTransaction();

  try {
    const fromUser = await User.findById(fromUserId).session(session);
    // const updateUser = await User.updateOne(
    //   { name: "krups" },
    //   { name: "Riddhi" }
    // ).session(session);
    // console.log(updateUser);
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

    await fromUser.save({ session_1 });
    await toUser.save({ session_1 });

    await Transaction.create(
      [
        {
          userId: fromUser._id,
          type: "debit",
          amount,
          description: `Transaction to ${toUser.name}`,
        },
        {
          userId: toUser._id,
          type: "credit",
          amount,
          description: `Transaction to ${fromUser.name}`,
        },
      ],
      { session_1, ordered: true }
    );

    //  Scenario 2: read before commit without session (old balance)
    // const fromUserOutside = await User.findById(fromUserId);
    // console.log("From User (outside session before commit):", fromUserOutside.balance);

    //  Scenario 3: with session read before commit(updated)
    // const fromUserInside = await User.findById(fromUserId).session(session);
    // console.log("From User (inside session before commit):", fromUserInside.balance);

    //  Scenario 4: Create 2nd session and read (old)
    // const session2 = await mongoose.startSession();
    // const fromUserInSession2 = await User.findById(fromUserId).session(session2);
    // console.log("From User (inside session2 before commit):", fromUserInSession2.balance);
    // await session2.endSession();
    await session_1.abortTransaction();
    await session.commitTransaction();
    session.endSession();

    // Scenario 5: without session read after commit(updated)
    // const fromUserAfterCommit = await User.findById(fromUserId);
    // console.log("From User (outside after commit):", fromUserAfterCommit.balance);

    res.send("Transaction done");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log("Transaction failed:", err.message);
    res.status(STATUS_CODES.InternalServerError).send("Transaction failed");
  }

  //  Scenario 6: Transaction abort
  // const sessionAbort = await mongoose.startSession();
  // sessionAbort.startTransaction();
  // const userAbort = await User.findById(fromUserId).session(sessionAbort);
  // userAbort.balance -= 50;
  // await userAbort.save({ session: sessionAbort });
  // await sessionAbort.abortTransaction();
  // sessionAbort.endSession();
  // const afterAbortCheck = await User.findById(fromUserId);
  // console.log("After Abort Transaction, From User balance:", afterAbortCheck.balance);

  //  Scenario 7: Two sessions
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
