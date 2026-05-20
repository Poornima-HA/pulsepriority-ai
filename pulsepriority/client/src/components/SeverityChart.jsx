import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e"
};

function SeverityChart({ patients }) {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  patients.forEach(p => {
    if (counts[p.severityLevel] !== undefined) counts[p.severityLevel]++;
  });

  const data = Object.entries(counts)
    .filter(([_, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="queue-card" style={{ marginTop: "16px", padding: "16px" }}>
      <div className="queue-header" style={{ marginBottom: "8px" }}>
        <h2 style={{ fontSize: "15px" }}>Severity Distribution</h2>
        <span className="queue-sub">Live breakdown</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px", color: "#fff" }}
          />
          <Legend
            formatter={(value) => <span style={{ color: "#9ca3af", fontSize: "12px" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SeverityChart;