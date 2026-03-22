import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#c8f135", "#6ee7b7", "#93c5fd", "#fda4af", "#fcd34d", "#a78bfa", "#fb923c", "#34d399"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1a1a1a",
        border: "1px solid #222",
        borderRadius: 8,
        padding: "8px 14px",
        fontFamily: "DM Mono, monospace",
        fontSize: 12,
        color: "#f0f0f0"
      }}>
        ₹{payload[0].value.toLocaleString("en-IN")}
      </div>
    );
  }
  return null;
};

export default function Analytics({ analytics }) {
  if (!analytics || analytics.message) {
    return (
      <div className="card">
        <p className="empty">No data yet. Add some expenses first.</p>
      </div>
    );
  }

  const categoryData = Object.entries(analytics.byCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const monthData = Object.entries(analytics.byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value }));

  return (
    <div className="analytics-grid">
      {/* Total Spent */}
      <div className="stat-card">
        <p className="stat-label">Total Spent</p>
        <p className="stat-value">₹{analytics.totalSpent.toLocaleString("en-IN")}</p>
      </div>

      {/* Top Category */}
      <div className="stat-card">
        <p className="stat-label">Top Category</p>
        <p className="stat-value" style={{ fontSize: 26 }}>
          {analytics.topCategory.name.charAt(0).toUpperCase() + analytics.topCategory.name.slice(1)}
        </p>
        <p className="stat-sub">₹{analytics.topCategory.amount.toLocaleString("en-IN")} spent</p>
      </div>

      {/* Monthly Bar Chart */}
      <div className="chart-card">
        <p className="card-title">Monthly Spending</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthData} barSize={32}>
            <XAxis
              dataKey="month"
              tick={{ fill: "#666", fontSize: 11, fontFamily: "DM Mono, monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#666", fontSize: 11, fontFamily: "DM Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" fill="#c8f135" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Pie Chart */}
      <div className="chart-card half">
        <p className="card-title">By Category</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(val) => (
                <span style={{ color: "#aaa", fontSize: 11, fontFamily: "DM Mono, monospace" }}>{val}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="chart-card half">
        <p className="card-title">Breakdown</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categoryData
            .sort((a, b) => b.value - a.value)
            .map((cat, i) => {
              const pct = Math.round((cat.value / analytics.totalSpent) * 100);
              return (
                <div key={cat.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#ccc" }}>{cat.name}</span>
                    <span style={{ fontSize: 12, color: COLORS[i % COLORS.length] }}>
                      ₹{cat.value.toLocaleString("en-IN")} · {pct}%
                    </span>
                  </div>
                  <div style={{ background: "#222", borderRadius: 99, height: 4 }}>
                    <div style={{
                      background: COLORS[i % COLORS.length],
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: 99,
                      transition: "width 0.6s ease"
                    }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
