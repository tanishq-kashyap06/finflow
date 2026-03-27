const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// CREATE EXPENSE
router.post("/", async (req, res) => {
  const { userId, amount, category, date } = req.body;

  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    return res.status(400).json({ error: "userId is required" });
  }
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }
  if (!category || typeof category !== "string" || category.trim() === "") {
    return res.status(400).json({ error: "category is required" });
  }
  if (date && isNaN(new Date(date).getTime())) {
    return res.status(400).json({ error: "invalid date format" });
  }

  try {
    const expense = new Expense({
      userId: userId.trim(),
      amount: Number(amount),
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
    });
    const savedExpense = await expense.save();
    res.json(savedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL EXPENSES
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE EXPENSE
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;