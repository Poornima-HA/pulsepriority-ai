require("dotenv").config();
const twilio = require("twilio");
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// In-memory patient queue with preloaded demo data
let patients = [
  {
    id: "demo-1",
    name: "Arjun Mehta",
    age: 72,
    spo2: 86,
    heartRate: 148,
    bpSystolic: 190,
    symptoms: ["Chest Pain", "Breathing Difficulty"],
    severityLevel: "Critical",
    severityScore: 100,
    color: "red",
    waitingSince: new Date(Date.now() - 8 * 60000),
    status: "Waiting"
  },
  {
    id: "demo-2",
    name: "Sunita Rao",
    age: 65,
    spo2: 91,
    heartRate: 125,
    bpSystolic: 170,
    symptoms: ["Severe Headache", "Vomiting Blood"],
    severityLevel: "Critical",
    severityScore: 88,
    color: "red",
    waitingSince: new Date(Date.now() - 5 * 60000),
    status: "In Treatment"
  },
  {
    id: "demo-3",
    name: "Vikram Singh",
    age: 45,
    spo2: 93,
    heartRate: 122,
    bpSystolic: 162,
    symptoms: ["Severe Pain"],
    severityLevel: "High",
    severityScore: 58,
    color: "orange",
    waitingSince: new Date(Date.now() - 12 * 60000),
    status: "Waiting"
  },
  {
    id: "demo-4",
    name: "Meena Iyer",
    age: 38,
    spo2: 96,
    heartRate: 88,
    bpSystolic: 130,
    symptoms: ["High Fever"],
    severityLevel: "Medium",
    severityScore: 32,
    color: "yellow",
    waitingSince: new Date(Date.now() - 20 * 60000),
    status: "Waiting"
  },
  {
    id: "demo-5",
    name: "Ravi Kumar",
    age: 28,
    spo2: 98,
    heartRate: 76,
    bpSystolic: 118,
    symptoms: ["Dizziness"],
    severityLevel: "Low",
    severityScore: 5,
    color: "green",
    waitingSince: new Date(Date.now() - 25 * 60000),
    status: "Waiting"
  }
];

// Add new patient
app.post("/api/patients", async (req, res) => {
  try {
    const data = req.body;

    // Call AI engine
    const aiResponse = await axios.post("https://pulsepriority-ai-engine.onrender.com", {
      spo2: data.spo2,
      heart_rate: data.heartRate,
      bp_systolic: data.bpSystolic,
      age: data.age,
      symptoms: data.symptoms
    });

    const { level, score, color } = aiResponse.data;

    const patient = {
      id: uuidv4(),
      name: data.name,
      age: data.age,
      spo2: data.spo2,
      heartRate: data.heartRate,
      bpSystolic: data.bpSystolic,
      symptoms: data.symptoms,
      severityLevel: level,
      severityScore: score,
      color: color,
      waitingSince: new Date(),
      status: "Waiting"
    };

    patients.push(patient);

    // Sort by severity score (highest first)
    patients.sort((a, b) => b.severityScore - a.severityScore);

    // Emit updated queue to all connected clients
    io.emit("queueUpdated", patients);

    res.json({ success: true, patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}); 

// Ambulance pre-arrival route
app.post("/api/ambulance", async (req, res) => {
  try {
    const data = req.body;

    // Call AI engine
    const aiResponse = await axios.post("https://pulsepriority-ai-engine.onrender.com", {
      spo2: data.spo2,
      heart_rate: data.heartRate,
      bp_systolic: data.bpSystolic,
      age: data.age,
      symptoms: data.symptoms
    });

    const { level, score, color } = aiResponse.data;

    const patient = {
      id: uuidv4(),
      name: data.name,
      age: data.age,
      spo2: data.spo2,
      heartRate: data.heartRate,
      bpSystolic: data.bpSystolic,
      symptoms: data.symptoms,
      severityLevel: level,
      severityScore: score,
      color: color,
      waitingSince: new Date(),
      status: "Incoming 🚑",
      isAmbulance: true,
      eta: data.eta,
      ambulanceId: data.ambulanceId,
      location: data.location
    };

    patients.push(patient);
    patients.sort((a, b) => b.severityScore - a.severityScore);
    io.emit("queueUpdated", patients); 
    // Send WhatsApp alert
    try {
      await twilioClient.messages.create({
       from: process.env.TWILIO_WHATSAPP_FROM,
       to: process.env.TWILIO_WHATSAPP_TO,
       body: `🚑 INCOMING AMBULANCE ALERT!\n\nAmbulance: ${patient.ambulanceId}\nPatient: ${patient.name}\nAge: ${patient.age}\nSeverity: ${patient.severityLevel} (Score: ${patient.severityScore})\nSymptoms: ${patient.symptoms.join(", ")}\nLocation: ${patient.location}\nETA: ${patient.eta}\n\n⚠️ Please prepare for immediate reception!\n\n— PulsePriority AI`
     });
     console.log("WhatsApp alert sent!");
    } catch (err) {
       console.error("WhatsApp error:", err.message);
      }   

    // Emit special ambulance alert
    io.emit("ambulanceAlert", {
      name: patient.name,
      severityLevel: level,
      score: score,
      eta: data.eta,
      ambulanceId: data.ambulanceId,
      location: data.location,
      symptoms: data.symptoms
    });

    res.json({ success: true, patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get all patients
app.get("/api/patients", (req, res) => {
  res.json(patients);
});

// Update patient status
app.patch("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  patients = patients.map(p => p.id === id ? { ...p, status } : p);
  io.emit("queueUpdated", patients);
  res.json({ success: true });
});

// Delete patient
app.delete("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  patients = patients.filter(p => p.id !== id);
  io.emit("queueUpdated", patients);
  res.json({ success: true });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.emit("queueUpdated", patients);
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});