import React, { useState } from 'react';
import '../../../css/theme-modern.css';
import '../../../css/Feedback.css';
import { submitFeedback } from '../../../services/feedbackClient';
import { useToast } from '../../ui/Toast.jsx';

export default function FeedbackForm({ title = 'Feedback' }) {
  const [form, setForm] = useState({ subject: '', message: '', rating: 5, category: 'General' });
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await submitFeedback(form);
      notify('Thanks for your feedback!', 'success');
      setForm({ subject: '', message: '', rating: 5, category: 'General' });
    } catch (err) {
      notify(err?.message || 'Failed to submit feedback', 'error');
    } finally { setBusy(false); }
  };

  return (
    <div className="dashboard-card feedback-card card-animated blob-bg fade-slide-up">
      <div className="feedback-header bg-animated-gradient"><h3>{title}</h3></div>
      <div className="card-content feedback-content">
        <form onSubmit={onSubmit} className="form grid-2">
          <div className="form-field">
            <label>Subject</label>
            <input name="subject" value={form.subject} onChange={onChange} required />
          </div>
          <div className="form-field">
            <label>Rating</label>
            <select name="rating" value={form.rating} onChange={onChange}>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Category</label>
            <select name="category" value={form.category} onChange={onChange}>
              {['General','Order','Product','App','Support'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Message</label>
            <textarea name="message" rows={4} value={form.message} onChange={onChange} required />
          </div>
          <div className="form-actions">
            <button className="view-all-btn btn-pulse" disabled={busy} type="submit">{busy ? 'Submitting...' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}