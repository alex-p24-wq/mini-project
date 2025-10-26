import React, { useState } from "react";
import "../../../css/FarmerDashboard.css";

// Mock disease predictor (placeholder for ML/API integration)
export default function DiseasePredictor() {
  const [form, setForm] = useState({ leafSpots: false, yellowing: false, wilting: false, humidity: 70, temp: 28 });
  const [prediction, setPrediction] = useState(null);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const predict = (e) => {
    e.preventDefault();
    // Very simple mock rules
    let risk = 0;
    if (form.leafSpots) risk += 40;
    if (form.yellowing) risk += 30;
    if (form.wilting) risk += 30;
    if (Number(form.humidity) > 80) risk += 10;
    if (Number(form.temp) > 32) risk += 10;

    const level = risk >= 70 ? 'High' : risk >= 40 ? 'Medium' : 'Low';
    setPrediction({ risk, level, advice: level === 'High' ? 'Inspect and apply recommended treatment' : level === 'Medium' ? 'Monitor closely; improve ventilation' : 'Keep regular monitoring' });
  };

  return (
    <div className="dashboard-card">
      <div className="card-header"><h3>Disease Predictor</h3></div>
      <div className="card-content">
        <form onSubmit={predict} className="form grid-3">
          <div className="form-field checkbox">
            <label>
              <input type="checkbox" name="leafSpots" checked={form.leafSpots} onChange={handleChange} /> Leaf spots
            </label>
          </div>
          <div className="form-field checkbox">
            <label>
              <input type="checkbox" name="yellowing" checked={form.yellowing} onChange={handleChange} /> Yellowing
            </label>
          </div>
          <div className="form-field checkbox">
            <label>
              <input type="checkbox" name="wilting" checked={form.wilting} onChange={handleChange} /> Wilting
            </label>
          </div>
          <div className="form-field">
            <label>Humidity (%)</label>
            <input type="number" name="humidity" min="0" max="100" value={form.humidity} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>Temperature (°C)</label>
            <input type="number" name="temp" value={form.temp} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button className="view-all-btn" type="submit">Predict</button>
          </div>
        </form>

        {prediction && (
          <div className="result" style={{ marginTop: 16 }}>
            <strong>Risk Level:</strong> {prediction.level} ({prediction.risk}%)<br />
            <strong>Advice:</strong> {prediction.advice}
          </div>
        )}
      </div>
    </div>
  );
}