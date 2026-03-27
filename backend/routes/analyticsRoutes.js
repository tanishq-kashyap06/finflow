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
// GET /analytics/predictions
router.get("/predictions", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: "user1" });

    if (expenses.length === 0) {
      return res.json({ message: "No data" });
    }

    // Group by month
    const byMonth = {};
    expenses.forEach((e) => {
      const month = new Date(e.date).toISOString().slice(0, 7);
      if (!byMonth[month]) byMonth[month] = {};
      const cat = e.category.toLowerCase();
      byMonth[month][cat] = (byMonth[month][cat] || 0) + e.amount;
    });

    const months = Object.keys(byMonth).sort();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = months[months.length - 2];
    const thisMonthData = byMonth[currentMonth] || {};
    const lastMonthData = byMonth[lastMonth] || {};

    // Projected end-of-month spend
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const thisMonthTotal = Object.values(thisMonthData).reduce((a, b) => a + b, 0);
    const projectedTotal = Math.round((thisMonthTotal / dayOfMonth) * daysInMonth);

    // Month-over-month by category
    const allCategories = new Set([
      ...Object.keys(thisMonthData),
      ...Object.keys(lastMonthData),
    ]);

    const categoryTrends = [];
    allCategories.forEach((cat) => {
      const current = thisMonthData[cat] || 0;
      const previous = lastMonthData[cat] || 0;
      const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;
      categoryTrends.push({ category: cat, current, previous, changePercent: change });
    });

    // Overspending alerts — categories up more than 20% vs last month
    const alerts = categoryTrends
      .filter((c) => c.changePercent !== null && c.changePercent > 20)
      .map((c) => ({
        category: c.category,
        changePercent: c.changePercent,
        current: c.current,
        previous: c.previous,
      }));

    res.json({
      currentMonth,
      thisMonthTotal,
      projectedTotal,
      daysInMonth,
      dayOfMonth,
      categoryTrends: categoryTrends.sort((a, b) => (b.current || 0) - (a.current || 0)),
      alerts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;