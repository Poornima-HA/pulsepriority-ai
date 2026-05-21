import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import SeverityChart from "./SeverityChart";

const socket = io("https://pulsepriority-ai-1.onrender.com");

function getWaitTime(since) {
  const diff = Math.floor((new Date() - new Date(since)) / 60000);
  return diff < 1 ? "Just now" : `${diff} min ago`;
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    axios.get("https://pulsepriority-ai-1.onrender.com/api/patients").then(res => setPatients(res.data));

    socket.on("queueUpdated", (data) => {
      setPatients(prev => {
        const newPatients = data.filter(d => !prev.find(p => p.id === d.id));
        if (newPatients.length > 0) {
          const newLogs = newPatients.map(p => ({
            id: p.id,
            time: getTime(),
            name: p.name,
            level: p.severityLevel,
            score: p.severityScore,
            type: "added"
          }));
          setActivityLog(prev => {
            const existingIds = prev.map(l => l.id);
            const uniqueLogs = newLogs.filter(l => !existingIds.includes(l.id));
            return [...uniqueLogs, ...prev].slice(0, 20);
          });
        }
        return data;
      });
    });

    return () => socket.off("queueUpdated");
  }, []);

  const handleDischarge = async (id, name) => {
    await axios.delete(`https://pulsepriority-ai-1.onrender.com/api/patients/${id}`);
    setActivityLog(prev => [{
      id: id + Date.now(),
      time: getTime(),
      name: name,
      level: "Discharged",
      type: "discharged"
    }, ...prev].slice(0, 20));
  };

  const handleStatus = async (id, status) => {
    await axios.patch(`https://pulsepriority-ai-1.onrender.com/api/patients/${id}`, { status });
  };

  const critical = patients.filter(p => p.severityLevel === "Critical").length;
  const high = patients.filter(p => p.severityLevel === "High").length;
  const total = patients.length;
  const avgWait = total === 0 ? 0 : Math.floor(
    patients.reduce((sum, p) => sum + (new Date() - new Date(p.waitingSince)) / 60000, 0) / total
  );

  const levelColor = { Critical: "#f87171", High: "#fb923c", Medium: "#fde047", Low: "#4ade80", Discharged: "#9ca3af" };
  const levelIcon = { Critical: "🔴", High: "🟠", Medium: "🟡", Low: "🟢", Discharged: "✅" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>

      {/* LEFT SIDE */}
      <div>
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">{total}</div>
          </div>
          <div className="stat-card critical">
            <div className="stat-label">Critical</div>
            <div className="stat-value red">{critical}</div>
          </div>
          <div className="stat-card high">
            <div className="stat-label">High Priority</div>
            <div className="stat-value orange">{high}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Wait</div>
            <div className="stat-value" style={{fontSize:"24px"}}>{avgWait} min</div>
          </div>
        </div>

        {/* Queue */}
        <div className="queue-card">
          <div className="queue-header">
            <h2>Live Patient Queue</h2>
            <span className="queue-sub">{total} patients • Auto-sorted by severity</span>
          </div>

          {patients.length === 0 ? (
            <div className="queue-empty">
              <div className="emoji">🏥</div>
              <p>No patients in queue</p>
              <p style={{fontSize:"13px", marginTop:"6px"}}>Add a patient using the + New Patient button</p>
            </div>
          ) : (
            <div>
              {patients.map((p, index) => {
                const level = p.severityLevel.toLowerCase();
                return (
                  <div key={p.id} className={`patient-row ${level}`}>
                    <div className="position">#{index + 1}</div>
                    <div className={`badge ${level}`}>{p.severityLevel}</div>
                    <div className={`score ${level}`}>{p.severityScore}</div>
                    <div>
                      <div className="patient-name">{p.name}</div>
                      <div className="patient-info">
                        Age {p.age} • SpO2 {p.spo2}% • HR {p.heartRate} bpm • BP {p.bpSystolic}
                      </div>
                      {p.symptoms.length > 0 && (
                        <div className="patient-symptoms">{p.symptoms.join(", ")}</div>
                      )}
                    </div>
                    <div className="wait-time">
                      <div>{getWaitTime(p.waitingSince)}</div>
                      <div className={`status-text ${level}`}>{p.status}</div>
                    </div>
                    <div className="actions">
                      <button className="btn-sm btn-treat" onClick={() => handleStatus(p.id, "In Treatment")}>
                        Treat
                      </button>
                      <button className="btn-sm btn-discharge" onClick={() => handleDischarge(p.id, p.name)}>
                        Discharge
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div>
        {/* Severity Chart */}
        <SeverityChart patients={patients} />

        {/* Activity Log */}
        <div className="queue-card" style={{marginTop:"16px"}}>
          <div className="queue-header">
            <h2 style={{fontSize:"15px"}}>Activity Log</h2>
            <span className="queue-sub">Live feed</span>
          </div>
          {activityLog.length === 0 ? (
            <div style={{padding:"40px 20px", textAlign:"center", color:"#6b7280", fontSize:"13px"}}>
              No activity yet
            </div>
          ) : (
            <div style={{maxHeight:"400px", overflowY:"auto"}}>
              {activityLog.map(log => (
                <div key={log.id} style={{
                  padding:"12px 16px",
                  borderBottom:"1px solid #1f2937",
                  display:"flex",
                  gap:"10px",
                  alignItems:"flex-start"
                }}>
                  <span style={{fontSize:"16px"}}>{levelIcon[log.level] || "⚪"}</span>
                  <div>
                    <div style={{fontSize:"13px", fontWeight:"600", color: levelColor[log.level] || "#fff"}}>
                      {log.name} — {log.level}
                      {log.score && ` (${log.score})`}
                    </div>
                    <div style={{fontSize:"11px", color:"#6b7280", marginTop:"2px"}}>
                      {log.type === "added" ? "Added to queue" : "Discharged"} • {log.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;