const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config();
const homeRoutes = require("./routes/homeRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/home", homeRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ DFS Demo API is running successfully.",
    time: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ API endpoint not found.",
  });
});

module.exports = app;
