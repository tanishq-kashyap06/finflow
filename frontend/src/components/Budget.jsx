import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const CATEGORIES = ["Food", "Transport", "Shopping", "Health", "Entertainment", "Rent", "Utilities"];

const currentMonth = new Date().toISOString().slice(0, 7);

export default function Budget() {
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ category: "Food", limit: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API}/budgets/status`);
      setStatus(res.data);
    } catch (e) {
      setStatus(null);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSave = async () => {
    if (!form.limit || isNaN(form.limit) || Number(form.limit) <= 0) {
      setMsg({ type: "error", text: "Enter a valid limit" });
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/budgets`, {
        userId: "user1",
        category: form.category,
        limit: Number(form.limit),
        month: currentMonth,
      });
      setMsg({ type: "success", text: `Budget set for ${form.category}` });
      setForm({ ...form, limit: "" });
      fetchStatus();
    } catch (e) {
      setMsg({ type: "error", text: "Failed to save budget" });
    }
    setSaving(false);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Set Budget Form */}
      <div className="card">
        <p className="card-title">Set Budget — {currentMonth}</p>
        <div className="form">
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            className="input"
            type="number"
            placeholder="Monthly limit (Rs.)"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
          />
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "SAVING..." : "SET BUDGET"}
          </button>
          {msg && (
            <p style={{ fontSize: 12, color: msg.type === "error" ? "#ff4444" : "#c8f135", textAlign: "center" }}>
              {msg.text}
            </p>
          )}
        </div>
      </div>

      {/* Budget Status */}
      {status && status.status && status.status.length > 0 ? (
        <div className="card">
          <p className="card-title">Budget Status — {status.month}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {status.status.map((b) => (
              <div key={b.category}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, textTransform: "capitalize", fontFamily: "Syne, sans-serif", fontWeight: 600 }}>
                    {b.category}
                  </span>
                  <span style={{ fontSize: 12, color: b.overBudget ? "#ff4444" : "#c8f135" }}>
                    Rs.{b.spent.toLocaleString("en-IN")} / Rs.{b.limit.toLocaleString("en-IN")}
                    {b.overBudget
                      ? `  ⚠ Over by Rs.${Math.abs(b.remaining).toLocaleString("en-IN")}`
                      : `  ✓ Rs.${b.remaining.toLocaleString("en-IN")} left`}
                  </span>
                </div>
                <div style={{ background: "#222", borderRadius: 99, height: 6 }}>
                  <div style={{
                    background: b.overBudget ? "#ff4444" : b.percentUsed > 80 ? "#fcd34d" : "#c8f135",
                    width: `${Math.min(100, b.percentUsed)}%`,
                    height: "100%",
                    borderRadius: 99,
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{b.percentUsed}% used</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="empty">No budgets set for this month yet. Add one above.</p>
        </div>
      )}

    </div>
  );
}
