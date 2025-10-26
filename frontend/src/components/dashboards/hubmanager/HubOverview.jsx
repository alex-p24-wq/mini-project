import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';

export default function HubOverview({ hubData, onRefresh }) {
  const { addNotification } = useNotifications();
  const [recentActivities, setRecentActivities] = useState([]);
  const [quickStats, setQuickStats] = useState({});

  useEffect(() => {
    if (hubData) {
      loadRecentActivities();
      calculateQuickStats();
    }
  }, [hubData]);

  const loadRecentActivities = () => {
    // Mock recent activities
    const activities = [
      {
        id: 1,
        type: 'order_received',
        message: 'New order from Ravi Kumar - 50kg Premium Cardamom',
        time: '2 minutes ago',
        icon: '📦',
        color: '#4caf50'
      },
      {
        id: 2,
        type: 'quality_check',
        message: 'Quality inspection completed for Batch #QC-2024-001',
        time: '15 minutes ago',
        icon: '✅',
        color: '#2196f3'
      },
      {
        id: 3,
        type: 'farmer_delivery',
        message: 'Suresh Babu delivered 75kg Organic Cardamom',
        time: '1 hour ago',
        icon: '🚚',
        color: '#ff9800'
      },
      {
        id: 4,
        type: 'processing',
        message: 'Processing batch #PR-2024-045 completed',
        time: '2 hours ago',
        icon: '⚙️',
        color: '#9c27b0'
      },
      {
        id: 5,
        type: 'shipment',
        message: 'Shipment dispatched to Chennai - Order #ORD-2024-156',
        time: '3 hours ago',
        icon: '🚛',
        color: '#607d8b'
      }
    ];
    setRecentActivities(activities);
  };

  const calculateQuickStats = () => {
    const stats = {
      todayRevenue: 45000,
      todayOrders: 12,
      pendingQuality: 8,
      storageAlert: hubData.currentStock > (hubData.capacity * 0.8)
    };
    setQuickStats(stats);
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        <div className="stat-trend">
          {trend && (
            <span className={`trend ${trend.type}`}>
              {trend.type === 'up' ? '↗️' : '↘️'} {trend.value}
            </span>
          )}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon, color, onClick }) => (
    <button className="quick-action-card" onClick={onClick}>
      <div className="action-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="action-arrow">→</div>
    </button>
  );

  return (
    <div className="hub-overview">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h2>Welcome back! 👋</h2>
          <p>Here's what's happening at your hub today</p>
        </div>
        <button className="refresh-btn" onClick={onRefresh}>
          🔄 Refresh Data
        </button>
      </div>

      {/* Key Statistics */}
      <div className="stats-grid">
        <StatCard
          title="Total Farmers"
          value={hubData?.stats?.totalFarmers || 0}
          subtitle="Connected farmers"
          icon="👨‍🌾"
          color="#4caf50"
          trend={{ type: 'up', value: '+12 this month' }}
        />
        <StatCard
          title="Active Orders"
          value={hubData?.stats?.activeOrders || 0}
          subtitle="Processing & pending"
          icon="📋"
          color="#2196f3"
          trend={{ type: 'up', value: '+5 today' }}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(hubData?.stats?.monthlyRevenue || 0).toLocaleString()}`}
          subtitle="This month"
          icon="💰"
          color="#ff9800"
          trend={{ type: 'up', value: '+18%' }}
        />
        <StatCard
          title="Storage Used"
          value={`${hubData?.stats?.storageUtilization || 0}%`}
          subtitle={`${hubData?.currentStock?.toLocaleString() || 0} / ${hubData?.capacity?.toLocaleString() || 0} kg`}
          icon="📦"
          color={hubData?.stats?.storageUtilization > 80 ? '#f44336' : '#9c27b0'}
        />
      </div>

      {/* Today's Quick Stats */}
      <div className="today-stats">
        <h3>Today's Performance</h3>
        <div className="today-grid">
          <div className="today-card">
            <div className="today-icon">💵</div>
            <div className="today-info">
              <h4>₹{quickStats.todayRevenue?.toLocaleString()}</h4>
              <p>Today's Revenue</p>
            </div>
          </div>
          <div className="today-card">
            <div className="today-icon">📦</div>
            <div className="today-info">
              <h4>{quickStats.todayOrders}</h4>
              <p>Orders Processed</p>
            </div>
          </div>
          <div className="today-card">
            <div className="today-icon">🔍</div>
            <div className="today-info">
              <h4>{quickStats.pendingQuality}</h4>
              <p>Pending Quality Checks</p>
            </div>
          </div>
          <div className="today-card">
            <div className="today-icon">⭐</div>
            <div className="today-info">
              <h4>{hubData?.stats?.qualityRating || 0}</h4>
              <p>Quality Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <QuickAction
            title="Process New Order"
            description="Handle incoming farmer deliveries"
            icon="📥"
            color="#4caf50"
            onClick={() => addNotification({ type: 'info', title: 'Feature', message: 'Order processing opened' })}
          />
          <QuickAction
            title="Quality Inspection"
            description="Perform quality checks on batches"
            icon="🔍"
            color="#2196f3"
            onClick={() => addNotification({ type: 'info', title: 'Feature', message: 'Quality inspection opened' })}
          />
          <QuickAction
            title="Generate Report"
            description="Create daily/weekly reports"
            icon="📊"
            color="#ff9800"
            onClick={() => addNotification({ type: 'info', title: 'Feature', message: 'Report generation opened' })}
          />
          <QuickAction
            title="Manage Inventory"
            description="Update stock levels and batches"
            icon="📦"
            color="#9c27b0"
            onClick={() => addNotification({ type: 'info', title: 'Feature', message: 'Inventory management opened' })}
          />
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <div className="activities-header">
          <h3>Recent Activities</h3>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="activities-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon" style={{ backgroundColor: `${activity.color}20`, color: activity.color }}>
                {activity.icon}
              </div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts & Notifications */}
      {quickStats.storageAlert && (
        <div className="alert-section">
          <div className="alert-card warning">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h4>Storage Capacity Alert</h4>
              <p>Your hub is at {hubData?.stats?.storageUtilization}% capacity. Consider processing or dispatching stock.</p>
            </div>
            <button className="alert-action">Take Action</button>
          </div>
        </div>
      )}
    </div>
  );
}
