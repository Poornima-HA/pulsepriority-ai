from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def calculate_severity(data):
    score = 0

    # SpO2 scoring (oxygen level)
    spo2 = data.get("spo2", 100)
    if spo2 < 90:    score += 40
    elif spo2 < 94:  score += 20
    elif spo2 < 97:  score += 5

    # Heart rate scoring
    hr = data.get("heart_rate", 80)
    if hr > 140 or hr < 40:    score += 35
    elif hr > 120 or hr < 50:  score += 15

    # Blood pressure scoring
    bp = data.get("bp_systolic", 120)
    if bp > 180 or bp < 70:    score += 30
    elif bp > 160 or bp < 90:  score += 10

    # Age risk
    age = data.get("age", 30)
    if age > 70 or age < 5:    score += 10
    elif age > 60:              score += 5

    # Symptoms scoring
    critical_symptoms = ["chest pain", "unconscious", "seizure", "stroke", "breathing difficulty"]
    high_symptoms = ["severe headache", "vomiting blood", "high fever", "severe pain"]
    
    symptoms = [s.lower() for s in data.get("symptoms", [])]
    
    for s in symptoms:
        if s in critical_symptoms:
            score += 25
            break
    
    for s in symptoms:
        if s in high_symptoms:
            score += 10
            break

    # Classify final score
    if score >= 70:
        level = "Critical"
        color = "red"
    elif score >= 45:
        level = "High"
        color = "orange"
    elif score >= 20:
        level = "Medium"
        color = "yellow"
    else:
        level = "Low"
        color = "green"

    return {"level": level, "score": min(score, 100), "color": color}


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    result = calculate_severity(data)
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "AI engine running"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=False)