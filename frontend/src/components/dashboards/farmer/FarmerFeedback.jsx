import React, { useState } from "react";
import "../../../css/FarmerDashboard.css";

export default function FarmerFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "", rating: 5 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    const item = { id: Date.now(), ...form, rating: Number(form.rating), createdAt: new Date().toISOString() };
    setFeedbacks((list) => [item, ...list]);
    setForm({ subject: "", message: "", rating: 5 });
  };

  return (
    <div className="dashboard-card">
      <div className="card-header"><h3>Farmer Feedback</h3></div>
      <div className="card-content">
        <form onSubmit={submit} className="form grid-2">
          <div className="form-field">
            <label>Subject</label>
            <input name="subject" value={form.subject} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Rating</label>
            <select name="rating" value={form.rating} onChange={handleChange}>
              {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={4} required />
          </div>
          <div className="form-actions">
            <button className="view-all-btn" type="submit">Submit</button>
          </div>
        </form>

        <div style={{ marginTop: 20 }}>
          {feedbacks.length === 0 ? (
            <p>No feedback yet.</p>
          ) : (
            feedbacks.map((f) => (
              <div key={f.id} className="feedback-item" style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{f.subject}</strong>
                  <span>{'★'.repeat(f.rating)}</span>
                </div>
                <div style={{ color: '#666', fontSize: 13 }}>{new Date(f.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 6 }}>{f.message}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}