require('dns').setDefaultResultOrder('ipv4first');

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const expenseRoutes = require("./routes/expenseRoutes.js");
const analyticsRoutes = require("./routes/analyticsRoutes.js");
const budgetRoutes = require("./routes/budgetRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err));

app.use("/expenses", expenseRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/budgets", budgetRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});