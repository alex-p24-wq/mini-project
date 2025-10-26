import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';

export default function HubInventory({ hubData }) {
  const { addNotification } = useNotifications();
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    loadInventoryData();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventoryData, searchTerm, filterGrade, filterStatus]);

  const loadInventoryData = () => {
    // Mock inventory data
    const mockInventory = [
      {
        id: 'BATCH-001',
        farmerName: 'Ravi Kumar',
        grade: 'Premium',
        quantity: 150,
        receivedDate: '2024-01-20',
        expiryDate: '2024-07-20',
        status: 'In Storage',
        location: 'Section A-1',
        qualityScore: 9.2,
        price: 1200,
        processingStatus: 'Ready',
        moistureContent: 8.5,
        defectRate: 2.1
      },
      {
        id: 'BATCH-002',
        farmerName: 'Priya Nair',
        grade: 'Organic',
        quantity: 200,
        receivedDate: '2024-01-19',
        expiryDate: '2024-07-19',
        status: 'Processing',
        location: 'Section B-2',
        qualityScore: 8.8,
        price: 1350,
        processingStatus: 'In Progress',
        moistureContent: 9.2,
        defectRate: 1.8
      },
      {
        id: 'BATCH-003',
        farmerName: 'Suresh Babu',
        grade: 'Regular',
        quantity: 100,
        receivedDate: '2024-01-18',
        expiryDate: '2024-07-18',
        status: 'Quality Check',
        location: 'Section C-1',
        qualityScore: 7.5,
        price: 950,
        processingStatus: 'Pending',
        moistureContent: 10.1,
        defectRate: 3.2
      },
      {
        id: 'BATCH-004',
        farmerName: 'Meera Thomas',
        grade: 'Premium',
        quantity: 175,
        receivedDate: '2024-01-17',
        expiryDate: '2024-07-17',
        status: 'Ready to Ship',
        location: 'Section A-3',
        qualityScore: 9.5,
        price: 1250,
        processingStatus: 'Completed',
        moistureContent: 8.0,
        defectRate: 1.5
      },
      {
        id: 'BATCH-005',
        farmerName: 'Arun Krishnan',
        grade: 'Organic',
        quantity: 125,
        receivedDate: '2024-01-16',
        expiryDate: '2024-07-16',
        status: 'Dispatched',
        location: 'N/A',
        qualityScore: 8.9,
        price: 1300,
        processingStatus: 'Shipped',
        moistureContent: 8.8,
        defectRate: 2.0
      }
    ];
    setInventoryData(mockInventory);
  };

  const filterInventory = () => {
    let filtered = inventoryData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterGrade !== 'all') {
      filtered = filtered.filter(item => item.grade === filterGrade);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    setFilteredData(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'In Storage': '#2196f3',
      'Processing': '#ff9800',
      'Quality Check': '#9c27b0',
      'Ready to Ship': '#4caf50',
      'Dispatched': '#607d8b'
    };
    return colors[status] || '#666';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'Premium': '#ffd700',
      'Organic': '#4caf50',
      'Regular': '#2196f3'
    };
    return colors[grade] || '#666';
  };

  const handleBatchAction = (batch, action) => {
    switch (action) {
      case 'view':
        setSelectedBatch(batch);
        break;
      case 'process':
        addNotification({
          type: 'success',
          title: 'Processing Started',
          message: `Batch ${batch.id} moved to processing`
        });
        break;
      case 'ship':
        addNotification({
          type: 'success',
          title: 'Ready for Shipment',
          message: `Batch ${batch.id} marked ready for shipment`
        });
        break;
      default:
        break;
    }
  };

  const BatchDetailModal = ({ batch, onClose }) => {
    if (!batch) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content batch-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Batch Details - {batch.id}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="batch-detail-grid">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-row">
                  <span>Farmer:</span>
                  <strong>{batch.farmerName}</strong>
                </div>
                <div className="detail-row">
                  <span>Grade:</span>
                  <span className="grade-badge" style={{ backgroundColor: getGradeColor(batch.grade) }}>
                    {batch.grade}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Quantity:</span>
                  <strong>{batch.quantity} kg</strong>
                </div>
                <div className="detail-row">
                  <span>Price:</span>
                  <strong>₹{batch.price}/kg</strong>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Quality Metrics</h4>
                <div className="detail-row">
                  <span>Quality Score:</span>
                  <strong>{batch.qualityScore}/10</strong>
                </div>
                <div className="detail-row">
                  <span>Moisture Content:</span>
                  <strong>{batch.moistureContent}%</strong>
                </div>
                <div className="detail-row">
                  <span>Defect Rate:</span>
                  <strong>{batch.defectRate}%</strong>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Status & Location</h4>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(batch.status) }}>
                    {batch.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Location:</span>
                  <strong>{batch.location}</strong>
                </div>
                <div className="detail-row">
                  <span>Processing:</span>
                  <strong>{batch.processingStatus}</strong>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Dates</h4>
                <div className="detail-row">
                  <span>Received:</span>
                  <strong>{new Date(batch.receivedDate).toLocaleDateString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Expiry:</span>
                  <strong>{new Date(batch.expiryDate).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary">Edit Batch</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="hub-inventory">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-left">
          <h2>Inventory Management</h2>
          <p>Manage your cardamom batches and stock levels</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Batch
        </button>
      </div>

      {/* Summary Cards */}
      <div className="inventory-summary">
        <div className="summary-card">
          <div className="summary-icon">📦</div>
          <div className="summary-info">
            <h3>{inventoryData.reduce((sum, item) => sum + item.quantity, 0)} kg</h3>
            <p>Total Stock</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🏭</div>
          <div className="summary-info">
            <h3>{inventoryData.filter(item => item.status === 'Processing').length}</h3>
            <p>In Processing</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <h3>{inventoryData.filter(item => item.status === 'Ready to Ship').length}</h3>
            <p>Ready to Ship</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⚠️</div>
          <div className="summary-info">
            <h3>{inventoryData.filter(item => item.status === 'Quality Check').length}</h3>
            <p>Quality Checks</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="inventory-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by farmer name or batch ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
            <option value="all">All Grades</option>
            <option value="Premium">Premium</option>
            <option value="Organic">Organic</option>
            <option value="Regular">Regular</option>
          </select>
        </div>
        <div className="filter-group">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="In Storage">In Storage</option>
            <option value="Processing">Processing</option>
            <option value="Quality Check">Quality Check</option>
            <option value="Ready to Ship">Ready to Ship</option>
            <option value="Dispatched">Dispatched</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Farmer</th>
              <th>Grade</th>
              <th>Quantity</th>
              <th>Quality Score</th>
              <th>Status</th>
              <th>Location</th>
              <th>Received Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(batch => (
              <tr key={batch.id}>
                <td>
                  <strong>{batch.id}</strong>
                </td>
                <td>{batch.farmerName}</td>
                <td>
                  <span className="grade-badge" style={{ backgroundColor: getGradeColor(batch.grade) }}>
                    {batch.grade}
                  </span>
                </td>
                <td>{batch.quantity} kg</td>
                <td>
                  <div className="quality-score">
                    <span className={`score ${batch.qualityScore >= 9 ? 'excellent' : batch.qualityScore >= 7 ? 'good' : 'average'}`}>
                      {batch.qualityScore}/10
                    </span>
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(batch.status) }}>
                    {batch.status}
                  </span>
                </td>
                <td>{batch.location}</td>
                <td>{new Date(batch.receivedDate).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon" 
                      title="View Details"
                      onClick={() => handleBatchAction(batch, 'view')}
                    >
                      👁️
                    </button>
                    {batch.status === 'In Storage' && (
                      <button 
                        className="btn-icon" 
                        title="Start Processing"
                        onClick={() => handleBatchAction(batch, 'process')}
                      >
                        ⚙️
                      </button>
                    )}
                    {batch.status === 'Processing' && (
                      <button 
                        className="btn-icon" 
                        title="Mark Ready to Ship"
                        onClick={() => handleBatchAction(batch, 'ship')}
                      >
                        🚛
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <BatchDetailModal 
          batch={selectedBatch} 
          onClose={() => setSelectedBatch(null)} 
        />
      )}
    </div>
  );
}
