import React from 'react';

export default function Filters({
  region, setRegion,
  period, setPeriod,
  variety, setVariety,
  onApply,
  className = ''
}) {
  return (
    <div className={`ui-filters ${className}`}>
      <select value={region} onChange={(e) => setRegion(e.target.value)}>
        <option value="">All regions</option>
        <option value="idukki">Idukki</option>
        <option value="wayanad">Wayanad</option>
        <option value="coorg">Coorg</option>
      </select>
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="12m">Last 12 months</option>
        <option value="ytd">YTD</option>
      </select>
      <select value={variety} onChange={(e) => setVariety(e.target.value)}>
        <option value="">All varieties</option>
        <option value="green">Green</option>
        <option value="black">Black</option>
        <option value="white">White</option>
      </select>
      <button className="view-all-btn" onClick={onApply}>Apply</button>
    </div>
  );
}