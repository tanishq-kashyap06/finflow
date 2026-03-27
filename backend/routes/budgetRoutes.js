const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// SET or UPDATE a budget limit
router.post("/", async (req, res) => {
  const { userId, category, limit, month } = req.body;

  if (!userId || !category || !limit || !month) {
    return res.status(400).json({ error: "userId, category, limit and month are required" });
  }
  if (isNaN(limit) || Number(limit) <= 0) {
    return res.status(400).json({ error: "limit must be a positive number" });
  }

  try {
    // Upsert — create or update if already exists
    const budget = await Budget.findOneAndUpdate(
      { userId, category: category.toLowerCase(), month },
      { limit: Number(limit) },
      { upsert: true, new: true }
    );
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET budget status for current month
router.get("/status", async (req, res) => {
  try {
    const month = new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ userId: "user1", month });

    if (budgets.length === 0) {
      return res.json({ message: "No budgets set for this month" });
    }

    // Get this month's expenses
    const startOfMonth = new Date(`${month}-01`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    const expenses = await Expense.find({
      userId: "user1",
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Sum by category
    const spentByCategory = {};
    expenses.forEach((e) => {
      const cat = e.category.toLowerCase();
      spentByCategory[cat] = (spentByCategory[cat] || 0) + e.amount;
    });

    // Compare against budgets
    const status = budgets.map((b) => {
      const spent = spentByCategory[b.category] || 0;
      const remaining = b.limit - spent;
      const pct = Math.round((spent / b.limit) * 100);
      return {
        category: b.category,
        limit: b.limit,
        spent,
        remaining,
        percentUsed: pct,
        overBudget: spent > b.limit,
      };
    });

    res.json({ month, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;