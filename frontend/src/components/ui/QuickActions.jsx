import React from 'react';

export default function QuickActions({ actions = [] }) {
  return (
    <div className="ui-quick-actions">
      {actions.map((a, i) => (
        <button key={i} className="view-all-btn" onClick={a.onClick} title={a.hint || ''}>
          {a.icon ? <span style={{ marginRight: 6 }}>{a.icon}</span> : null}
          {a.label}
        </button>
      ))}
    </div>
  );
}