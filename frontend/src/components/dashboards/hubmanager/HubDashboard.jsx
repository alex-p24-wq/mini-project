import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import HubOverview from './HubOverview';
import HubOrders from './HubOrders';
import HubFarmers from './HubFarmers';
import HubAnalytics from './HubAnalytics';
import HubSettings from './HubSettings';
import './HubDashboard.css';

export default function HubDashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load hub data
  useEffect(() => {
    loadHubData();
  }, []);

  const loadHubData = async () => {
    try {
      setLoading(true);
      // Mock hub data - in real app, fetch from API
      const mockHubData = {
        id: 'hub_001',
        name: 'Kumily Cardamom Hub',
        state: 'Kerala',
        district: 'Idukki',
        address: 'Kumily Market Road, Kumily, Idukki District',
        contactPerson: user?.username || 'Hub Manager',
        phone: '+91 9876543210',
        email: user?.email || 'hub@cardamom.com',
        capacity: 5000,
        currentStock: 3250,
        services: ['Storage', 'Processing', 'Quality Testing', 'Transportation'],
        operatingHours: '6:00 AM - 8:00 PM',
        isActive: true,
        registrationDate: '2024-01-15',
        stats: {
          totalFarmers: 156,
          activeOrders: 23,
          monthlyRevenue: 485000,
          storageUtilization: 65,
          qualityRating: 4.8,
          processingCapacity: 200 // kg per day
        }
      };
      setHubData(mockHubData);
    } catch (error) {
      console.error('Error loading hub data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load hub data'
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'farmers', label: 'Farmers', icon: '👨‍🌾' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="hub-loading">
          <div className="loading-spinner"></div>
          <p>Loading hub dashboard...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <HubOverview hubData={hubData} onRefresh={loadHubData} />;
      case 'orders':
        return <HubOrders hubData={hubData} />;
      case 'farmers':
        return <HubFarmers hubData={hubData} />;
      case 'analytics':
        return <HubAnalytics hubData={hubData} />;
      case 'settings':
        return <HubSettings hubData={hubData} onUpdate={setHubData} />;
      default:
        return <HubOverview hubData={hubData} onRefresh={loadHubData} />;
    }
  };

  return (
    <div className="hub-dashboard">
      {/* Header */}
      <div className="hub-header">
        <div className="hub-header-content">
          <div className="hub-title-section">
            <div className="hub-icon">🏪</div>
            <div className="hub-title-info">
              <h1>{hubData?.name || 'Hub Dashboard'}</h1>
              <p className="hub-location">
                📍 {hubData?.district}, {hubData?.state}
              </p>
            </div>
          </div>
          <div className="hub-status-section">
            <div className={`hub-status ${hubData?.isActive ? 'active' : 'inactive'}`}>
              <span className="status-dot"></span>
              {hubData?.isActive ? 'Active' : 'Inactive'}
            </div>
            <div className="hub-capacity">
              <span className="capacity-label">Capacity</span>
              <span className="capacity-value">
                {hubData?.currentStock?.toLocaleString() || 0} / {hubData?.capacity?.toLocaleString() || 0} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="hub-nav">
        <div className="hub-nav-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`hub-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="hub-content">
        {renderTabContent()}
      </div>
    </div>
  );
}
