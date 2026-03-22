const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// GET /analytics/summary
// Returns: total spent, by category, by month, top category
router.get("/summary", async (req, res) => {
  try {
    const expenses = await Expense.find();

    if (expenses.length === 0) {
      return res.json({ message: "No expenses found" });
    }

    // 1. Total spent
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 2. Breakdown by category
    const byCategory = {};
    expenses.forEach((e) => {
      const cat = e.category.toLowerCase();
      byCategory[cat] = (byCategory[cat] || 0) + e.amount;
    });

    // 3. Monthly totals (e.g. "2025-03": 450)
    const byMonth = {};
    expenses.forEach((e) => {
      const month = new Date(e.date).toISOString().slice(0, 7); // "YYYY-MM"
      byMonth[month] = (byMonth[month] || 0) + e.amount;
    });

    // 4. Top spending category
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    res.json({
      totalSpent,
      byCategory,
      byMonth,
      topCategory: {
        name: topCategory[0],
        amount: topCategory[1],
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;