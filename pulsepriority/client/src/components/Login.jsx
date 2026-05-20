import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (["admin", "doctor", "nurse"].includes(username) && password === "pulse123") {
        onLogin();
      } else {
        setError("Invalid credentials. Try admin / pulse123");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e8f7fc, #d4eef7, #c8e8f5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Floating background circles */}
      <div style={{
        position: "absolute", width: "300px", height: "300px",
        background: "rgba(8,145,178,0.06)", borderRadius: "50%",
        top: "-80px", left: "-80px", animation: "floatBubble 6s ease-in-out infinite"
      }}/>
      <div style={{
        position: "absolute", width: "200px", height: "200px",
        background: "rgba(8,145,178,0.05)", borderRadius: "50%",
        bottom: "-60px", right: "-60px", animation: "floatBubble 8s ease-in-out infinite reverse"
      }}/>
      <div style={{
        position: "absolute", width: "150px", height: "150px",
        background: "rgba(8,145,178,0.04)", borderRadius: "50%",
        top: "60%", left: "10%", animation: "floatBubble 7s ease-in-out infinite"
      }}/>

      {/* ECG line at top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: "24px", overflow: "hidden",
        background: "rgba(14,165,233,0.05)"
      }}>
        <svg viewBox="0 0 2400 24" preserveAspectRatio="none" style={{width:"200%", height:"24px"}}>
          <polyline
            style={{
              fill: "none", stroke: "#0891b2", strokeWidth: "1.5",
              opacity: 0.3, animation: "ecgMove 6s linear infinite"
            }}
            points="0,12 100,12 120,12 125,4 130,20 135,4 140,12 200,12 300,12 320,12 325,4 330,20 335,4 340,12 400,12 500,12 520,12 525,4 530,20 535,4 540,12 600,12 700,12 720,12 725,4 730,20 735,4 740,12 800,12 900,12 920,12 925,4 930,20 935,4 940,12 1000,12 1100,12 1120,12 1125,4 1130,20 1135,4 1140,12 1200,12 1300,12 1320,12 1325,4 1330,20 1335,4 1340,12 1400,12 1500,12 1520,12 1525,4 1530,20 1535,4 1540,12 1600,12 1700,12 1720,12 1725,4 1730,20 1735,4 1740,12 1800,12 1900,12 1920,12 1925,4 1930,20 1935,4 1940,12 2000,12 2100,12 2120,12 2125,4 2130,20 2135,4 2140,12 2200,12 2300,12 2320,12 2325,4 2330,20 2335,4 2340,12 2400,12"
          />
        </svg>
      </div>

      {/* Login Card */}
      <div style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(14,165,233,0.2)",
        borderRadius: "24px",
        padding: "48px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 20px 60px rgba(8,145,178,0.12), 0 0 0 1px rgba(255,255,255,0.5)",
        animation: "cardSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative",
        zIndex: 10
      }}>

        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          {/* Animated heart icon */}
          <div style={{
            width: "64px", height: "64px",
            background: "linear-gradient(135deg, #e0f7fa, #b2ebf2)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            border: "2px solid rgba(8,145,178,0.2)",
            boxShadow: "0 0 20px rgba(8,145,178,0.15)",
            animation: "heartbeat 1.5s ease-in-out infinite"
          }}>
            <span style={{ fontSize: "28px" }}>🏥</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{
              width: "10px", height: "10px",
              background: "#ef4444", borderRadius: "50%",
              boxShadow: "0 0 10px rgba(239,68,68,0.6)",
              animation: "pulse 1.5s infinite"
            }}></div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#0369a1" }}>
              PulsePriority AI
            </h1>
          </div>
          <p style={{ color: "#0891b2", fontSize: "13px", fontWeight: "600" }}>
            Hospital Emergency Management System
          </p>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
            🔒 Authorized Personnel Only
          </p>

          {/* Role badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "14px" }}>
            {["👨‍⚕️ Doctor", "👩‍⚕️ Nurse", "🛡️ Admin"].map(role => (
              <span key={role} style={{
                fontSize: "10px", padding: "3px 10px",
                background: "rgba(8,145,178,0.08)",
                border: "1px solid rgba(8,145,178,0.2)",
                borderRadius: "99px", color: "#0891b2", fontWeight: "600"
              }}>{role}</span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div style={{
              background: "#fee2e2", border: "1px solid #fca5a5",
              borderRadius: "8px", padding: "10px 14px",
              fontSize: "13px", color: "#dc2626",
              animation: "cardSlideUp 0.3s ease"
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className="submit-btn"
            onClick={handleLogin}
            disabled={loading || !username || !password}
            style={{ marginTop: "8px" }}
          >
            {loading ? "🔐 Authenticating..." : "Login to Dashboard →"}
          </button>
        </div>

        {/* Credentials hint */}
        <div style={{
          marginTop: "20px", padding: "12px 16px",
          background: "rgba(8,145,178,0.04)",
          border: "1px solid rgba(8,145,178,0.15)",
          borderRadius: "10px", fontSize: "12px",
          color: "#64748b", textAlign: "center"
        }}>
          Demo credentials:<br />
          <span style={{ color: "#0891b2", fontWeight: "700" }}>
            admin / doctor / nurse
          </span>
          {" "}→ password:{" "}
          <span style={{ color: "#0891b2", fontWeight: "700" }}>pulse123</span>
        </div>

      </div>

      <style>{`
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes cardSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(8,145,178,0.15); }
          50% { transform: scale(1.08); box-shadow: 0 0 30px rgba(8,145,178,0.25); }
        }
        @keyframes ecgMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-600px); }
        }
      `}</style>
    </div>
  );
}

export default Login;