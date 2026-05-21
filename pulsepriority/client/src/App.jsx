import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import PatientForm from "./components/PatientForm";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AmbulanceMap from "./components/AmbulanceMap";

const socket = io("https://pulsepriority-ai-1.onrender.com");

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [alert, setAlert] = useState(null);
  const [ambulanceAlert, setAmbulanceAlert] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showAmbulance, setShowAmbulance] = useState(false);

  const playAlertSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const beep = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    beep(880, 0, 0.2);
    beep(880, 0.3, 0.2);
    beep(880, 0.6, 0.2);
  };

  const playAmbulanceSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const siren = (start) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.8);
      osc.frequency.setValueAtTime(600, ctx.currentTime + start);
      osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + start + 0.4);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + start + 0.8);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.8);
    };
    siren(0);
    siren(0.9);
    siren(1.8);
  };

  useEffect(() => {
    socket.on("queueUpdated", (patients) => {
      const critical = patients.filter(p => p.severityLevel === "Critical" && !p.isAmbulance);
      if (critical.length > 0) {
        const latest = critical[0];
        playAlertSound();
        setAlert({
          name: latest.name,
          score: latest.severityScore,
          symptoms: latest.symptoms
        });
        setTimeout(() => setAlert(null), 5000);
      }
    });

    socket.on("ambulanceAlert", (data) => {
      playAmbulanceSound();
      setAmbulanceAlert(data);
      setTimeout(() => setAmbulanceAlert(null), 8000);
    });

    return () => {
      socket.off("queueUpdated");
      socket.off("ambulanceAlert");
    };
  }, []);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="pulse"></div>
          <h1>PulsePriority AI</h1>
          <span className="live-badge">LIVE</span>
          <span className="ai-tag">⚡ Auto Triage Enabled</span>
        </div>
        <div className="header-right">
          <button
            className={`btn ${activeTab === "dashboard" ? "btn-active" : "btn-ghost"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`btn ${activeTab === "intake" ? "btn-active" : "btn-primary"}`}
            onClick={() => setActiveTab("intake")}
          >
            + New Patient
          </button>
          <button
            className="btn"
            onClick={() => setShowAmbulance(true)}
            style={{
              background: "linear-gradient(135deg, #ea580c, #dc2626)",
              color: "white",
              boxShadow: "0 4px 12px rgba(234,88,12,0.3)",
              animation: "ambulancePulse 2s infinite"
            }}
          >
            🚑 Live Ambulance
          </button>
          <button className="btn btn-ghost" onClick={() => setLoggedIn(false)}>
            Logout
          </button>
        </div>
      </div>

      {/* ECG Line */}
      <div className="ecg-bar">
        <svg viewBox="0 0 2400 24" preserveAspectRatio="none" style={{width:"200%", height:"24px"}}>
          <polyline
            className="ecg-line"
            points="0,12 100,12 120,12 125,4 130,20 135,4 140,12 200,12 300,12 320,12 325,4 330,20 335,4 340,12 400,12 500,12 520,12 525,4 530,20 535,4 540,12 600,12 700,12 720,12 725,4 730,20 735,4 740,12 800,12 900,12 920,12 925,4 930,20 935,4 940,12 1000,12 1100,12 1120,12 1125,4 1130,20 1135,4 1140,12 1200,12 1300,12 1320,12 1325,4 1330,20 1335,4 1340,12 1400,12 1500,12 1520,12 1525,4 1530,20 1535,4 1540,12 1600,12 1700,12 1720,12 1725,4 1730,20 1735,4 1740,12 1800,12 1900,12 1920,12 1925,4 1930,20 1935,4 1940,12 2000,12 2100,12 2120,12 2125,4 2130,20 2135,4 2140,12 2200,12 2300,12 2320,12 2325,4 2330,20 2335,4 2340,12 2400,12"
          />
        </svg>
      </div>

      {/* Critical Alert Banner */}
      {alert && (
        <div className="alert-banner">
          <div className="alert-content">
            <span className="alert-icon">🚨</span>
            <div>
              <div className="alert-text">
                CRITICAL PATIENT — {alert.name} — Score {alert.score}
              </div>
              <div className="alert-sub">
                {alert.symptoms.length > 0
                  ? `Symptoms: ${alert.symptoms.join(", ")}`
                  : "Immediate attention required"}
              </div>
            </div>
          </div>
          <button className="alert-close" onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      {/* Ambulance Alert Banner */}
      {ambulanceAlert && (
        <div className="alert-banner" style={{
          background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
          borderBottom: "2px solid #fdba74",
          boxShadow: "0 4px 20px rgba(249,115,22,0.15)"
        }}>
          <div className="alert-content">
            <span className="alert-icon">🚑</span>
            <div>
              <div className="alert-text" style={{ color: "#ea580c" }}>
                INCOMING AMBULANCE — {ambulanceAlert.ambulanceId} — {ambulanceAlert.name} — Score {ambulanceAlert.score}
              </div>
              <div className="alert-sub" style={{ color: "#f97316" }}>
                📍 {ambulanceAlert.location} • 🕐 ETA: {ambulanceAlert.eta} • {ambulanceAlert.severityLevel}
              </div>
            </div>
          </div>
          <button className="alert-close" style={{ color: "#f97316" }}
            onClick={() => setAmbulanceAlert(null)}>×</button>
        </div>
      )}

      {/* Ambulance Map */}
      {showAmbulance && (
        <AmbulanceMap onClose={() => setShowAmbulance(false)} />
      )}

      {/* Content */}
      <div className="content">
        {activeTab === "dashboard" ? (
          <Dashboard />
        ) : (
          <PatientForm onSuccess={() => setActiveTab("dashboard")} />
        )}
      </div>
    </div>
  );
}

export default App;