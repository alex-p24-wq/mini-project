import React from 'react';
import { motion } from 'framer-motion';

export function Card({ className = '', children, elevated = true, as: Comp = 'div', ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`ui-card ${elevated ? 'elevated' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`ui-card-header ${className}`}>
      <div>
        {title && <h3 className="ui-card-title">{title}</h3>}
        {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="ui-card-actions">{actions}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`ui-card-content ${className}`}>{children}</div>;
}

export function StatCard({ icon, value, label, accent = '#43a047' }) {
  return (
    <Card className="ui-stat-card">
      <div className="ui-stat-icon" style={{ backgroundColor: accent }}>{icon}</div>
      <div className="ui-stat-body">
        <div className="ui-stat-value">{value}</div>
        <div className="ui-stat-label">{label}</div>
      </div>
    </Card>
  );
}