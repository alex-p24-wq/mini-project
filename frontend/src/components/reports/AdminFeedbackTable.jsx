import React, { useEffect, useState } from 'react';
import { adminListFeedback } from '../../services/feedbackClient';

export default function AdminFeedbackTable() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ role: '', category: '', minRating: '', maxRating: '', q: '' });

  const fetchData = async (page = 1) => {
    setLoading(true); setError('');
    try {
      const res = await adminListFeedback({ ...filters, page, limit: data.limit || 20 });
      setData(res);
    } catch (e) { setError(e?.message || 'Failed to load feedback'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); }, []);

  return (
    <div className="fade-slide-up">
      <div className="feedback-filters" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <select value={filters.role} onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}>
          <option value="">All roles</option>
          {['customer','farmer','agricare','hub','admin'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}>
          <option value="">All categories</option>
          {['General','Order','Product','App','Support'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="Min rating" min={1} max={5} value={filters.minRating} onChange={(e) => setFilters(f => ({ ...f, minRating: e.target.value }))} />
        <input type="number" placeholder="Max rating" min={1} max={5} value={filters.maxRating} onChange={(e) => setFilters(f => ({ ...f, maxRating: e.target.value }))} />
        <input placeholder="Search..." value={filters.q} onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))} />
        <button className="view-all-btn btn-pulse" onClick={() => fetchData(1)}>Apply</button>
      </div>

      {loading ? <p>Loading...</p> : error ? <p className="err-text">{error}</p> : (
        data.items.length === 0 ? <p>No feedback found</p> : (
          <div>
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Subject</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(f => (
                  <tr key={f._id} className="fade-slide-up">
                    <td>{new Date(f.createdAt).toLocaleString()}</td>
                    <td>{f.user?.username || '-'}<div style={{ color: '#666', fontSize: 12 }}>{f.user?.email}</div></td>
                    <td>{f.role}</td>
                    <td>{f.category}</td>
                    <td>{'★'.repeat(f.rating)}</td>
                    <td>{f.subject}</td>
                    <td>{f.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="view-all-btn btn-pulse" disabled={data.page <= 1} onClick={() => fetchData(data.page - 1)}>Prev</button>
              <span>Page {data.page}</span>
              <button className="view-all-btn btn-pulse" disabled={(data.page * data.limit) >= data.total} onClick={() => fetchData(data.page + 1)}>Next</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}