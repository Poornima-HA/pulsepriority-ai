import { useState, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import axios from "axios";

const HOSPITAL = { lat: 12.9716, lng: 77.5946 };

const AMBULANCE_LOCATIONS = [
  { id: "KA-108-A", name: "Ramesh Kumar", lat: 12.9352, lng: 77.6245, location: "Koramangala", symptoms: ["Chest Pain", "Breathing Difficulty"], age: 68, spo2: 86, heartRate: 148, bpSystolic: 190 },
  { id: "KA-108-B", name: "Priya Nair", lat: 13.0100, lng: 77.5560, location: "Hebbal", symptoms: ["Stroke", "Unconscious"], age: 45, spo2: 91, heartRate: 125, bpSystolic: 170 },
  { id: "KA-108-C", name: "Suresh Mehta", lat: 12.9698, lng: 77.7499, location: "Whitefield", symptoms: ["Seizure"], age: 72, spo2: 88, heartRate: 140, bpSystolic: 185 },
];

const mapContainerStyle = { width: "100%", height: "400px", borderRadius: "12px" };

function AmbulanceMap({ onClose }) {
  const [dispatched, setDispatched] = useState([]);
  const [loading, setLoading] = useState(null);
  const [eta, setEta] = useState({});
  const [countdown, setCountdown] = useState({});
  const [arrived, setArrived] = useState([]);
  const intervalRefs = useRef({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
  Object.keys(countdown).forEach(id => {
    if (!intervalRefs.current[id] && countdown[id] > 0) {
      intervalRefs.current[id] = setInterval(() => {
        setCountdown(prev => {
          const newVal = (prev[id] || 0) - 1;
          if (newVal <= 0) {
            clearInterval(intervalRefs.current[id]);
            delete intervalRefs.current[id];
            setArrived(a => [...a, id]);
            return { ...prev, [id]: 0 };
          }
          return { ...prev, [id]: newVal };
        });
      }, 1000);
    }
  });
 }, [JSON.stringify(countdown)]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const dispatch = async (amb) => {
    setLoading(amb.id);
    const etaMinutes = Math.floor(Math.random() * 10) + 5;
    setEta(prev => ({ ...prev, [amb.id]: { duration: `${etaMinutes} mins`, distance: "Via Bengaluru roads" } }));
    setCountdown(prev => ({ ...prev, [amb.id]: etaMinutes * 60 }));

    try {
      await axios.post("http://localhost:5000/api/ambulance", {
        name: amb.name,
        age: amb.age,
        spo2: amb.spo2,
        heartRate: amb.heartRate,
        bpSystolic: amb.bpSystolic,
        symptoms: amb.symptoms,
        ambulanceId: amb.id,
        location: amb.location,
        eta: `${etaMinutes} mins`
      });
      setDispatched(prev => [...prev, amb.id]);
    } catch (err) {
      alert("Error dispatching");
    }
    setLoading(null);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "white", borderRadius: "20px", padding: "28px",
        width: "100%", maxWidth: "800px", maxHeight: "90vh",
        overflowY: "auto",
        border: "2px solid rgba(249,115,22,0.3)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>🚑</span>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0369a1" }}>Live Ambulance Tracking</h2>
              <p style={{ fontSize: "12px", color: "#64748b" }}>108 Emergency Network — Bengaluru Real-Time</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}>×</button>
        </div>

        {/* Live indicator */}
        <div style={{
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "10px", padding: "10px 16px",
          display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px"
        }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1s infinite" }}/>
          <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: "600" }}>
            LIVE — Bengaluru Emergency Network — {AMBULANCE_LOCATIONS.length} ambulances tracked
          </span>
        </div>

        {/* Map */}
        {isLoaded ? (
          <GoogleMap mapContainerStyle={mapContainerStyle} center={HOSPITAL} zoom={12}>
            <Marker position={HOSPITAL} label={{ text: "🏥", fontSize: "24px" }} />
            {AMBULANCE_LOCATIONS.map(amb => (
              <Marker
                key={amb.id}
                position={{ lat: amb.lat, lng: amb.lng }}
                label={{ text: arrived.includes(amb.id) ? "✅" : "🚑", fontSize: "20px" }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div style={{
            height: "400px", borderRadius: "12px", background: "#f0fdfe",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(14,165,233,0.2)", color: "#0891b2", fontSize: "14px", fontWeight: "600"
          }}>🗺️ Loading Bengaluru map...</div>
        )}

        {/* Ambulance list */}
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {AMBULANCE_LOCATIONS.map(amb => (
            <div key={amb.id} style={{
              background: arrived.includes(amb.id) ? "rgba(34,197,94,0.08)" : dispatched.includes(amb.id) ? "rgba(249,115,22,0.04)" : "#f8fafc",
              border: arrived.includes(amb.id) ? "1px solid rgba(34,197,94,0.4)" : dispatched.includes(amb.id) ? "1px solid rgba(249,115,22,0.3)" : "1px solid rgba(14,165,233,0.15)",
              borderRadius: "12px", padding: "16px",
              display: "flex", alignItems: "center", gap: "16px", transition: "0.3s"
            }}>
              <div style={{
                width: "48px", height: "48px",
                background: arrived.includes(amb.id) ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.1)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", flexShrink: 0
              }}>
                {arrived.includes(amb.id) ? "✅" : "🚑"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: "#0369a1" }}>{amb.id}</span>
                  {eta[amb.id] && !arrived.includes(amb.id) && (
                    <span style={{ fontSize: "10px", padding: "2px 8px", background: "rgba(239,68,68,0.1)", color: "#dc2626", borderRadius: "99px", fontWeight: "600" }}>
                      🕐 {eta[amb.id].duration}
                    </span>
                  )}
                  {arrived.includes(amb.id) && (
                    <span style={{ fontSize: "10px", padding: "2px 8px", background: "rgba(34,197,94,0.1)", color: "#16a34a", borderRadius: "99px", fontWeight: "600" }}>
                      ✅ Arrived at Hospital
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 2px" }}>📍 {amb.location}, Bengaluru</p>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>👤 {amb.name} • Age {amb.age} • SpO2 {amb.spo2}%</p>
                <p style={{ fontSize: "11px", color: "#dc2626", margin: "2px 0 0", fontWeight: "600" }}>{amb.symptoms.join(", ")}</p>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {arrived.includes(amb.id) ? (
                  <div style={{ fontSize: "13px", color: "#16a34a", fontWeight: "700" }}>Arrived ✓</div>
                ) : dispatched.includes(amb.id) ? (
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: countdown[amb.id] < 60 ? "#dc2626" : "#ea580c", fontFamily: "monospace" }}>
                      {formatTime(countdown[amb.id] || 0)}
                    </div>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>ETA countdown</div>
                  </div>
                ) : (
                  <button
                    onClick={() => dispatch(amb)}
                    disabled={loading === amb.id}
                    style={{
                      background: "linear-gradient(135deg, #ea580c, #dc2626)",
                      color: "white", border: "none", padding: "8px 16px", borderRadius: "8px",
                      fontSize: "12px", fontWeight: "700", cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(234,88,12,0.3)"
                    }}
                  >
                    {loading === amb.id ? "Sending..." : "Dispatch →"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", marginTop: "16px" }}>
          Real-time routing via Google Maps • Bengaluru 108 Network
        </p>
      </div>
    </div>
  );
}

export default AmbulanceMap;