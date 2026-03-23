import { useState } from "react";

const CATEGORIES = ["Food", "Transport", "Shopping", "Health", "Entertainment", "Rent", "Utilities", "Other"];

export default function AddExpense({ onAdd }) {
  const [form, setForm] = useState({
    userId: "user1",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
  });

  const handleSubmit = () => {
    if (!form.amount || isNaN(form.amount)) return;
    onAdd({ ...form, amount: parseFloat(form.amount) });
    setForm((f) => ({ ...f, amount: "" }));
  };

  return (
    <div className="card">
      <p className="card-title">Add Expense</p>
      <div className="form">
        <input
          className="input"
          type="number"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <select
          className="input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          className="input"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button className="btn-primary" onClick={handleSubmit}>
          + ADD
        </button>
      </div>
    </div>
  );
}
