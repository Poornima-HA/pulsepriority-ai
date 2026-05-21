import { useState } from "react";
import axios from "axios";

const SYMPTOMS = [
  "Chest Pain", "Unconscious", "Seizure", "Stroke",
  "Breathing Difficulty", "Severe Headache", "Vomiting Blood",
  "High Fever", "Severe Pain", "Dizziness"
];

function PatientForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: "", age: "", spo2: "", heartRate: "", bpSystolic: "", symptoms: []
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const toggleSymptom = (symptom) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/patients", {
        ...form,
        age: Number(form.age),
        spo2: Number(form.spo2),
        heartRate: Number(form.heartRate),
        bpSystolic: Number(form.bpSystolic),
      });
      setResult(res.data.patient);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      alert("Error submitting patient");
    }
    setLoading(false);
  };

  if (result) return (
    <div className={`result-card ${result.severityLevel.toLowerCase()}`}>
      <div className="result-level">{result.severityLevel}</div>
      <div className="result-score">{result.severityScore}</div>
      <div className="result-label">Severity Score</div>
      <div className="result-redirect">Redirecting to dashboard...</div>
    </div>
  );

  return (
    <div className="form-container">
      <h2 className="form-title">Patient Intake</h2>
      <div className="form-card">

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input
              className="form-input"
              placeholder="Full name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-input"
              placeholder="Years"
              value={form.age}
              onChange={e => setForm({...form, age: e.target.value})}
            />
          </div>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">SpO2 (%)</label>
            <input
              type="number"
              className="form-input"
              placeholder="98"
              value={form.spo2}
              onChange={e => setForm({...form, spo2: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Heart Rate (bpm)</label>
            <input
              type="number"
              className="form-input"
              placeholder="80"
              value={form.heartRate}
              onChange={e => setForm({...form, heartRate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">BP Systolic</label>
            <input
              type="number"
              className="form-input"
              placeholder="120"
              value={form.bpSystolic}
              onChange={e => setForm({...form, bpSystolic: e.target.value})}
            />
          </div>
        </div>

        <div className="symptoms-label">Symptoms</div>
        <div className="symptoms-grid">
          {SYMPTOMS.map(s => (
            <button
              key={s}
              onClick={() => toggleSymptom(s)}
              className={`symptom-btn ${form.symptoms.includes(s) ? "active" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !form.name || !form.age}
        >
          {loading ? "Analyzing..." : "Analyze & Add to Queue"}
        </button>

      </div>
    </div>
  );
}

export default PatientForm;