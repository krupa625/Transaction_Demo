const mongoose = require("mongoose");
const { mongo_url } = require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(mongo_url, {});
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
