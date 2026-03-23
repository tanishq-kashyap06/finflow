export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="card">
        <p className="card-title">Expenses</p>
        <p className="empty">No expenses yet. Add one.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="card-title">Expenses — {expenses.length} entries</p>
      <div className="expense-list">
        {expenses.map((e) => (
          <div className="expense-item" key={e._id}>
            <div className="expense-left">
              <span className="expense-category">{e.category}</span>
              <span className="expense-date">
                {new Date(e.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="expense-right">
              <span className="expense-amount">₹{e.amount.toLocaleString("en-IN")}</span>
              <button className="btn-delete" onClick={() => onDelete(e._id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
