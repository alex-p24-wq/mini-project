import React, { useState } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';

export default function HubSettings({ hubData, onUpdate }) {
  const { addNotification } = useNotifications();
  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState({
    name: hubData?.name || '',
    address: hubData?.address || '',
    contactPerson: hubData?.contactPerson || '',
    phone: hubData?.phone || '',
    email: hubData?.email || '',
    capacity: hubData?.capacity || '',
    operatingHours: hubData?.operatingHours || '',
    services: hubData?.services || [],
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      lowStockAlert: true,
      qualityAlert: true,
      orderAlert: true
    },
    quality: {
      minQualityScore: 7.0,
      autoReject: false,
      requireCertification: false
    },
    pricing: {
      premiumRate: 1200,
      organicRate: 1350,
      regularRate: 950,
      processingFee: 50,
      storageFee: 10
    }
  });

  const serviceOptions = [
    'Storage', 'Processing', 'Packaging', 'Quality Testing', 'Transportation', 'Export Services'
  ];

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleServiceChange = (service, checked) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, service]
        : prev.services.filter(s => s !== service)
    }));
  };

  const handleSave = (section) => {
    // Mock save operation
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: `${section} settings have been updated successfully`
    });

    if (section === 'general') {
      onUpdate({ ...hubData, ...formData });
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'quality', label: 'Quality Control', icon: '🔍' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Settings</h3>
      <div className="settings-form">
        <div className="form-group">
          <label>Hub Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange(null, 'name', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange(null, 'address', e.target.value)}
            rows="3"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange(null, 'contactPerson', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange(null, 'email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Storage Capacity (kg)</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange(null, 'capacity', e.target.value)}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Operating Hours</label>
          <input
            type="text"
            value={formData.operatingHours}
            onChange={(e) => handleInputChange(null, 'operatingHours', e.target.value)}
            placeholder="e.g., 6:00 AM - 8:00 PM"
          />
        </div>
        
        <div className="form-group">
          <label>Services Offered</label>
          <div className="checkbox-grid">
            {serviceOptions.map(service => (
              <label key={service} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.services.includes(service)}
                  onChange={(e) => handleServiceChange(service, e.target.checked)}
                />
                {service}
              </label>
            ))}
          </div>
        </div>
        
        <button className="btn-primary" onClick={() => handleSave('general')}>
          Save General Settings
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      <div className="settings-form">
        <div className="notification-group">
          <h4>Alert Methods</h4>
          <label className="toggle-item">
            <input
              type="checkbox"
              checked={formData.notifications.emailAlerts}
              onChange={(e) => handleInputChange('notifications', 'emailAlerts', e.target.checked)}
            />
            <span>Email Alerts</span>
          </label>
          <label className="toggle-item">
            <input
              type="checkbox"
              checked={formData.notifications.smsAlerts}
              onChange={(e) => handleInputChange('notifications', 'smsAlerts', e.target.checked)}
            />
            <span>SMS Alerts</span>
          </label>
        </div>
        
        <div className="notification-group">
          <h4>Alert Types</h4>
          <label className="toggle-item">
            <input
              type="checkbox"
              checked={formData.notifications.lowStockAlert}
              onChange={(e) => handleInputChange('notifications', 'lowStockAlert', e.target.checked)}
            />
            <span>Low Stock Alerts</span>
          </label>
          <label className="toggle-item">
            <input
              type="checkbox"
              checked={formData.notifications.qualityAlert}
              onChange={(e) => handleInputChange('notifications', 'qualityAlert', e.target.checked)}
            />
            <span>Quality Issue Alerts</span>
          </label>
          <label className="toggle-item">
            <input
              type="checkbox"
              checked={formData.notifications.orderAlert}
              onChange={(e) => handleInputChange('notifications', 'orderAlert', e.target.checked)}
            />
            <span>New Order Alerts</span>
          </label>
        </div>
        
        <button className="btn-primary" onClick={() => handleSave('notifications')}>
          Save Notification Settings
        </button>
      </div>
    </div>
  );

  const renderQualitySettings = () => (
    <div className="settings-section">
      <h3>Quality Control Settings</h3>
      <div className="settings-form">
        <div className="form-group">
          <label>Minimum Quality Score</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.quality.minQualityScore}
            onChange={(e) => handleInputChange('quality', 'minQualityScore', parseFloat(e.target.value))}
          />
          <small>Batches below this score will be flagged for review</small>
        </div>
        
        <label className="toggle-item">
          <input
            type="checkbox"
            checked={formData.quality.autoReject}
            onChange={(e) => handleInputChange('quality', 'autoReject', e.target.checked)}
          />
          <span>Auto-reject batches below minimum score</span>
        </label>
        
        <label className="toggle-item">
          <input
            type="checkbox"
            checked={formData.quality.requireCertification}
            onChange={(e) => handleInputChange('quality', 'requireCertification', e.target.checked)}
          />
          <span>Require organic certification for organic grade</span>
        </label>
        
        <button className="btn-primary" onClick={() => handleSave('quality')}>
          Save Quality Settings
        </button>
      </div>
    </div>
  );

  const renderPricingSettings = () => (
    <div className="settings-section">
      <h3>Pricing Configuration</h3>
      <div className="settings-form">
        <div className="pricing-grid">
          <div className="form-group">
            <label>Premium Rate (₹/kg)</label>
            <input
              type="number"
              value={formData.pricing.premiumRate}
              onChange={(e) => handleInputChange('pricing', 'premiumRate', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Organic Rate (₹/kg)</label>
            <input
              type="number"
              value={formData.pricing.organicRate}
              onChange={(e) => handleInputChange('pricing', 'organicRate', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Regular Rate (₹/kg)</label>
            <input
              type="number"
              value={formData.pricing.regularRate}
              onChange={(e) => handleInputChange('pricing', 'regularRate', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Processing Fee (₹/kg)</label>
            <input
              type="number"
              value={formData.pricing.processingFee}
              onChange={(e) => handleInputChange('pricing', 'processingFee', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Storage Fee (₹/kg/day)</label>
            <input
              type="number"
              value={formData.pricing.storageFee}
              onChange={(e) => handleInputChange('pricing', 'storageFee', parseFloat(e.target.value))}
            />
          </div>
        </div>
        
        <button className="btn-primary" onClick={() => handleSave('pricing')}>
          Save Pricing Settings
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security Settings</h3>
      <div className="settings-form">
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" placeholder="Enter current password" />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" placeholder="Enter new password" />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" />
        </div>
        
        <button className="btn-primary" onClick={() => handleSave('security')}>
          Update Password
        </button>
        
        <div className="security-actions">
          <h4>Account Actions</h4>
          <button className="btn-secondary">Download Data</button>
          <button className="btn-danger">Deactivate Hub</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'quality':
        return renderQualitySettings();
      case 'pricing':
        return renderPricingSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="hub-settings">
      <div className="settings-header">
        <h2>Hub Settings</h2>
        <p>Configure your hub preferences and policies</p>
      </div>
      
      <div className="settings-container">
        <div className="settings-sidebar">
          {sections.map(section => (
            <button
              key={section.id}
              className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
            </button>
          ))}
        </div>
        
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
