const User = require("../models/user");
const { STATUS_CODES } = require("../utils/statuscode");

const userCreate = async (req, res) => {
  const { name, email, balance } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(STATUS_CODES.BadRequest)
        .send("User with this email already exists");

    const newUser = new User({ name, email, balance });
    await newUser.save();

    res
      .status(STATUS_CODES.Create)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    res.status(STATUS_CODES.InternalServerError).send("Error: " + err.message);
  }
};

module.exports = { userCreate };
