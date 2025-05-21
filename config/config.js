const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongo_url: process.env.MONGO_URL || "mongodb://localhost:27017/",
};
