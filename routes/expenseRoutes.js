const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// CREATE EXPENSE
router.post("/", async (req, res) => {
  try {
    const expense = new Expense({
      userId: req.body.userId,
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date || new Date()
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