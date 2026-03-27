import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const API = "http://localhost:5000";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1a1a1a", border: "1px solid #222", borderRadius: 8,
        padding: "8px 14px", fontFamily: "DM Mono, monospace", fontSize: 12, color: "#f0f0f0"
      }}>
        ₹{payload[0].value.toLocaleString("en-IN")}
      </div>
    );
  }
  return null;
};

export default function Predictions() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/analytics/predictions`).then((r) => setData(r.data));
  }, []);

  if (!data || data.message) return (
    <div className="card"><p className="empty">Not enough data for predictions yet.</p></div>
  );

  const progressPct = Math.min(100, Math.round((data.thisMonthTotal / data.projectedTotal) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Projection Card */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="stat-card">
          <p className="stat-label">Spent This Month</p>
          <p className="stat-value">₹{data.thisMonthTotal.toLocaleString("en-IN")}</p>
          <p className="stat-sub">day {data.dayOfMonth} of {data.daysInMonth}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Projected Total</p>
          <p className="stat-value" style={{ color: data.projectedTotal > data.thisMonthTotal * 1.3 ? "#ff4444" : "#c8f135" }}>
            ₹{data.projectedTotal.toLocaleString("en-IN")}
          </p>
          <p className="stat-sub">by end of month</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="stat-card">
        <p className="stat-label" style={{ marginBottom: 12 }}>Month Progress</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#666" }}>
          <span>₹0</span>
          <span>₹{data.projectedTotal.toLocaleString("en-IN")}</span>
        </div>
        <div style={{ background: "#222", borderRadius: 99, height: 8 }}>
          <div style={{
            background: "#c8f135", width: `${progressPct}%`,
            height: "100%", borderRadius: 99, transition: "width 0.8s ease"
          }} />
        </div>
        <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>{progressPct}% of projected spend used</p>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="stat-card" style={{ borderColor: "#ff444433" }}>
          <p className="stat-label" style={{ color: "#ff4444" }}>⚠ Overspending Alerts</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {data.alerts.map((a) => (
              <div key={a.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, textTransform: "capitalize" }}>{a.category}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "#ff4444", fontSize: 13, fontWeight: 600 }}>+{a.changePercent}%</span>
                  <span style={{ color: "#666", fontSize: 11, marginLeft: 8 }}>
                    ₹{a.previous.toLocaleString("en-IN")} → ₹{a.current.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category MoM Chart */}
      <div className="chart-card">
        <p className="card-title">This Month vs Last Month</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.categoryTrends} barSize={18} barGap={4}>
            <XAxis
              dataKey="category"
              tick={{ fill: "#666", fontSize: 11, fontFamily: "DM Mono, monospace" }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
            />
            <YAxis
              tick={{ fill: "#666", fontSize: 11, fontFamily: "DM Mono, monospace" }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="previous" fill="#333" radius={[4, 4, 0, 0]} name="Last Month" />
            <Bar dataKey="current" radius={[4, 4, 0, 0]} name="This Month">
              {data.categoryTrends.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.changePercent > 20 ? "#ff4444" : "#c8f135"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#666" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, background: "#333", borderRadius: 2, marginRight: 5 }} />
            Last month
          </span>
          <span style={{ fontSize: 11, color: "#666" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, background: "#c8f135", borderRadius: 2, marginRight: 5 }} />
            This month
          </span>
          <span style={{ fontSize: 11, color: "#666" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, background: "#ff4444", borderRadius: 2, marginRight: 5 }} />
            Overspending
          </span>
        </div>
      </div>

    </div>
  );
}
