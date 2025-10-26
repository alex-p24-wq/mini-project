import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';

export default function HubFarmers({ hubData }) {
  const { addNotification } = useNotifications();
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => {
    loadFarmers();
  }, []);

  useEffect(() => {
    filterFarmers();
  }, [farmers, searchTerm, filterStatus]);

  const loadFarmers = () => {
    // Mock farmers data
    const mockFarmers = [
      {
        id: 'F001',
        name: 'Ravi Kumar',
        email: 'ravi.kumar@email.com',
        phone: '+91 9876543210',
        state: 'Kerala',
        district: 'Idukki',
        farmSize: '2.5 acres',
        joinDate: '2023-06-15',
        status: 'Active',
        totalDeliveries: 24,
        totalQuantity: 1250,
        totalEarnings: 1500000,
        averageQuality: 8.9,
        lastDelivery: '2024-01-20',
        preferredGrades: ['Premium', 'Organic'],
        certifications: ['Organic', 'Fair Trade']
      },
      {
        id: 'F002',
        name: 'Priya Nair',
        email: 'priya.nair@email.com',
        phone: '+91 9876543211',
        state: 'Kerala',
        district: 'Idukki',
        farmSize: '3.2 acres',
        joinDate: '2023-04-22',
        status: 'Active',
        totalDeliveries: 32,
        totalQuantity: 1680,
        totalEarnings: 2100000,
        averageQuality: 9.2,
        lastDelivery: '2024-01-19',
        preferredGrades: ['Premium'],
        certifications: ['Organic']
      },
      {
        id: 'F003',
        name: 'Suresh Babu',
        email: 'suresh.babu@email.com',
        phone: '+91 9876543212',
        state: 'Kerala',
        district: 'Wayanad',
        farmSize: '1.8 acres',
        joinDate: '2023-08-10',
        status: 'Active',
        totalDeliveries: 18,
        totalQuantity: 890,
        totalEarnings: 950000,
        averageQuality: 7.8,
        lastDelivery: '2024-01-18',
        preferredGrades: ['Regular', 'Premium'],
        certifications: []
      },
      {
        id: 'F004',
        name: 'Meera Thomas',
        email: 'meera.thomas@email.com',
        phone: '+91 9876543213',
        state: 'Kerala',
        district: 'Idukki',
        farmSize: '4.1 acres',
        joinDate: '2023-03-05',
        status: 'Active',
        totalDeliveries: 45,
        totalQuantity: 2300,
        totalEarnings: 2875000,
        averageQuality: 9.5,
        lastDelivery: '2024-01-17',
        preferredGrades: ['Premium'],
        certifications: ['Organic', 'Fair Trade', 'Rainforest Alliance']
      },
      {
        id: 'F005',
        name: 'Arun Krishnan',
        email: 'arun.krishnan@email.com',
        phone: '+91 9876543214',
        state: 'Kerala',
        district: 'Wayanad',
        farmSize: '2.0 acres',
        joinDate: '2023-07-18',
        status: 'Inactive',
        totalDeliveries: 12,
        totalQuantity: 580,
        totalEarnings: 725000,
        averageQuality: 8.1,
        lastDelivery: '2023-12-15',
        preferredGrades: ['Organic'],
        certifications: ['Organic']
      }
    ];
    setFarmers(mockFarmers);
  };

  const filterFarmers = () => {
    let filtered = farmers;

    if (searchTerm) {
      filtered = filtered.filter(farmer =>
        farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(farmer => farmer.status.toLowerCase() === filterStatus.toLowerCase());
    }

    setFilteredFarmers(filtered);
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? '#4caf50' : '#f44336';
  };

  const getQualityColor = (score) => {
    if (score >= 9) return '#4caf50';
    if (score >= 7) return '#ff9800';
    return '#f44336';
  };

  const handleFarmerAction = (farmer, action) => {
    switch (action) {
      case 'view':
        setSelectedFarmer(farmer);
        break;
      case 'contact':
        addNotification({
          type: 'info',
          title: 'Contact',
          message: `Contacting ${farmer.name} at ${farmer.phone}`
        });
        break;
      case 'toggle_status':
        const newStatus = farmer.status === 'Active' ? 'Inactive' : 'Active';
        setFarmers(prevFarmers =>
          prevFarmers.map(f =>
            f.id === farmer.id ? { ...f, status: newStatus } : f
          )
        );
        addNotification({
          type: 'success',
          title: 'Status Updated',
          message: `${farmer.name} status changed to ${newStatus}`
        });
        break;
      default:
        break;
    }
  };

  const FarmerDetailModal = ({ farmer, onClose }) => {
    if (!farmer) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content farmer-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Farmer Profile - {farmer.name}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="farmer-detail-grid">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <div className="detail-row">
                  <span>Farmer ID:</span>
                  <strong>{farmer.id}</strong>
                </div>
                <div className="detail-row">
                  <span>Name:</span>
                  <strong>{farmer.name}</strong>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <strong>{farmer.email}</strong>
                </div>
                <div className="detail-row">
                  <span>Phone:</span>
                  <strong>{farmer.phone}</strong>
                </div>
                <div className="detail-row">
                  <span>Location:</span>
                  <strong>{farmer.district}, {farmer.state}</strong>
                </div>
              </div>

              <div className="detail-section">
                <h4>Farm Information</h4>
                <div className="detail-row">
                  <span>Farm Size:</span>
                  <strong>{farmer.farmSize}</strong>
                </div>
                <div className="detail-row">
                  <span>Join Date:</span>
                  <strong>{new Date(farmer.joinDate).toLocaleDateString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(farmer.status) }}>
                    {farmer.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Preferred Grades:</span>
                  <div className="grade-tags">
                    {farmer.preferredGrades.map(grade => (
                      <span key={grade} className="grade-tag">{grade}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Performance Metrics</h4>
                <div className="detail-row">
                  <span>Total Deliveries:</span>
                  <strong>{farmer.totalDeliveries}</strong>
                </div>
                <div className="detail-row">
                  <span>Total Quantity:</span>
                  <strong>{farmer.totalQuantity.toLocaleString()} kg</strong>
                </div>
                <div className="detail-row">
                  <span>Total Earnings:</span>
                  <strong>₹{farmer.totalEarnings.toLocaleString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Average Quality:</span>
                  <span className="quality-score" style={{ color: getQualityColor(farmer.averageQuality) }}>
                    {farmer.averageQuality}/10
                  </span>
                </div>
                <div className="detail-row">
                  <span>Last Delivery:</span>
                  <strong>{new Date(farmer.lastDelivery).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="detail-section">
                <h4>Certifications</h4>
                {farmer.certifications.length > 0 ? (
                  <div className="certification-tags">
                    {farmer.certifications.map(cert => (
                      <span key={cert} className="certification-tag">{cert}</span>
                    ))}
                  </div>
                ) : (
                  <p>No certifications</p>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary">Send Message</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="hub-farmers">
      {/* Header */}
      <div className="farmers-header">
        <div className="header-left">
          <h2>Farmer Management</h2>
          <p>Manage relationships with your cardamom farmers</p>
        </div>
        <button className="btn-primary">+ Add Farmer</button>
      </div>

      {/* Summary Stats */}
      <div className="farmers-summary">
        <div className="summary-card">
          <div className="summary-icon">👨‍🌾</div>
          <div className="summary-info">
            <h3>{farmers.length}</h3>
            <p>Total Farmers</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <h3>{farmers.filter(f => f.status === 'Active').length}</h3>
            <p>Active Farmers</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📦</div>
          <div className="summary-info">
            <h3>{farmers.reduce((sum, f) => sum + f.totalDeliveries, 0)}</h3>
            <p>Total Deliveries</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⭐</div>
          <div className="summary-info">
            <h3>{(farmers.reduce((sum, f) => sum + f.averageQuality, 0) / farmers.length).toFixed(1)}</h3>
            <p>Avg Quality Score</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="farmers-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search farmers by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="farmers-grid">
        {filteredFarmers.map(farmer => (
          <div key={farmer.id} className="farmer-card">
            <div className="farmer-header">
              <div className="farmer-avatar">
                {farmer.name.charAt(0).toUpperCase()}
              </div>
              <div className="farmer-info">
                <h3>{farmer.name}</h3>
                <p>{farmer.id}</p>
              </div>
              <div className="farmer-status">
                <span className="status-badge" style={{ backgroundColor: getStatusColor(farmer.status) }}>
                  {farmer.status}
                </span>
              </div>
            </div>

            <div className="farmer-details">
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span>{farmer.district}, {farmer.state}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Farm Size:</span>
                <span>{farmer.farmSize}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Deliveries:</span>
                <span>{farmer.totalDeliveries}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quality Score:</span>
                <span className="quality-score" style={{ color: getQualityColor(farmer.averageQuality) }}>
                  {farmer.averageQuality}/10
                </span>
              </div>
            </div>

            <div className="farmer-stats">
              <div className="stat-item">
                <h4>{farmer.totalQuantity.toLocaleString()} kg</h4>
                <p>Total Delivered</p>
              </div>
              <div className="stat-item">
                <h4>₹{(farmer.totalEarnings / 1000).toFixed(0)}K</h4>
                <p>Total Earnings</p>
              </div>
            </div>

            <div className="farmer-actions">
              <button 
                className="btn-icon" 
                title="View Profile"
                onClick={() => handleFarmerAction(farmer, 'view')}
              >
                👁️
              </button>
              <button 
                className="btn-icon" 
                title="Contact Farmer"
                onClick={() => handleFarmerAction(farmer, 'contact')}
              >
                📞
              </button>
              <button 
                className="btn-icon" 
                title={farmer.status === 'Active' ? 'Deactivate' : 'Activate'}
                onClick={() => handleFarmerAction(farmer, 'toggle_status')}
              >
                {farmer.status === 'Active' ? '🔴' : '🟢'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Farmer Detail Modal */}
      {selectedFarmer && (
        <FarmerDetailModal 
          farmer={selectedFarmer} 
          onClose={() => setSelectedFarmer(null)} 
        />
      )}
    </div>
  );
}
