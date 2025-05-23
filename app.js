const express = require("express");
const { port } = require("./config/config");
const app = express();
const connectDB = require("./config/db");

const route = require("./routes/index");

const cors = require("cors");

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", route);

app.get("/", (req, res) => {
  res.send("Passbook API Running");
});
app.all("*all", (req, res) => {
  res.status(404).send("Route not found");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
