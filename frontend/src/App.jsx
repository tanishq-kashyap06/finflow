import { useState, useEffect } from "react";
import axios from "axios";
import AddExpense from "./components/AddExpense";
import ExpenseList from "./components/ExpenseList";
import Analytics from "./components/Analytics";
import "./App.css";

const API = "http://localhost:5000";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("expenses");

  const fetchExpenses = async () => {
    const res = await axios.get(`${API}/expenses`);
    setExpenses(res.data);
  };

  const fetchAnalytics = async () => {
    const res = await axios.get(`${API}/analytics/summary`);
    setAnalytics(res.data);
  };

  useEffect(() => {
    fetchExpenses();
    fetchAnalytics();
  }, []);

  const handleAdd = async (data) => {
    await axios.post(`${API}/expenses`, data);
    fetchExpenses();
    fetchAnalytics();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/expenses/${id}`);
    fetchExpenses();
    fetchAnalytics();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">FF</span>
            <span className="logo-text">FinFlow</span>
          </div>
          <nav className="tabs">
            <button
              className={`tab ${activeTab === "expenses" ? "active" : ""}`}
              onClick={() => setActiveTab("expenses")}
            >
              Expenses
            </button>
            <button
              className={`tab ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {activeTab === "expenses" ? (
          <div className="expenses-view">
            <AddExpense onAdd={handleAdd} />
            <ExpenseList expenses={expenses} onDelete={handleDelete} />
          </div>
        ) : (
          <Analytics analytics={analytics} />
        )}
      </main>
    </div>
  );
}
