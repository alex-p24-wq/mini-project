import React from 'react';
import { motion } from 'framer-motion';

// Lightweight SVG area/line chart to avoid extra deps
// Expects data: [{x: <number>, y: <number>}, ...]
export default function AreaLineChart({ data = [], height = 160, color = '#43a047' }) {
  if (!data.length) return <div style={{ height, display: 'grid', placeItems: 'center', color: '#78909c' }}>No data</div>;

  const width = 480; // fixed for card grid; can be made responsive with ResizeObserver
  const pad = 16;
  const xs = data.map(d => d.x);
  const ys = data.map(d => d.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = 0, yMax = Math.max(1, Math.max(...ys));
  const sx = (x) => pad + ((x - xMin) / (xMax - xMin || 1)) * (width - pad * 2);
  const sy = (y) => height - pad - (y - yMin) / (yMax - yMin || 1) * (height - pad * 2);

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${sx(d.x).toFixed(2)} ${sy(d.y).toFixed(2)}`).join(' ');
  const area = `${line} L ${sx(xMax).toFixed(2)} ${sy(0)} L ${sx(xMin).toFixed(2)} ${sy(0)} Z`;

  return (
    <motion.svg width={width} height={height} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#grad)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" />
    </motion.svg>
  );
}