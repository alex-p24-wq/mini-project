import React from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', onSubmit }) {
  const handleKey = (e) => {
    if (e.key === 'Enter' && onSubmit) onSubmit();
  };
  return (
    <div className="ui-searchbar">
      <span className="ui-search-icon">🔎</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
      />
      {onSubmit && <button className="view-all-btn" onClick={onSubmit}>Search</button>}
    </div>
  );
}