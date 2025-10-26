import React, { useState, useEffect, useContext } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import { HubNetworkContext } from '../../../contexts/HubNetworkContext';

export default function HubOrders({ hubData }) {
  const { addNotification } = useNotifications();
  const { addAcceptedRequest } = useContext(HubNetworkContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab, searchTerm]);

  const loadOrders = () => {
    // Mock orders data
    const mockOrders = [
      {
        id: 'ORD-2024-001',
        customerName: 'Spice World Ltd',
        customerEmail: 'orders@spiceworld.com',
        customerPhone: '+91 9876543210',
        items: [
          { batchId: 'BATCH-001', grade: 'Premium', quantity: 50, price: 1200 },
          { batchId: 'BATCH-004', grade: 'Premium', quantity: 25, price: 1250 }
        ],
        totalAmount: 91250,
        status: 'Processing',
        orderDate: '2024-01-20',
        expectedDelivery: '2024-01-25',
        shippingAddress: '123 Spice Market, Mumbai, Maharashtra',
        paymentStatus: 'Paid',
        priority: 'High'
      },
      {
        id: 'ORD-2024-002',
        customerName: 'Kerala Spices Export',
        customerEmail: 'export@keralaspices.com',
        customerPhone: '+91 9876543211',
        items: [
          { batchId: 'BATCH-002', grade: 'Organic', quantity: 100, price: 1350 }
        ],
        totalAmount: 135000,
        status: 'Ready to Ship',
        orderDate: '2024-01-19',
        expectedDelivery: '2024-01-24',
        shippingAddress: '456 Export House, Kochi, Kerala',
        paymentStatus: 'Paid',
        priority: 'Medium'
      },
      {
        id: 'ORD-2024-003',
        customerName: 'Cardamom Traders',
        customerEmail: 'info@cardamomtraders.com',
        customerPhone: '+91 9876543212',
        items: [
          { batchId: 'BATCH-003', grade: 'Regular', quantity: 75, price: 950 }
        ],
        totalAmount: 71250,
        status: 'Pending',
        orderDate: '2024-01-18',
        expectedDelivery: '2024-01-23',
        shippingAddress: '789 Trade Center, Chennai, Tamil Nadu',
        paymentStatus: 'Pending',
        priority: 'Low'
      },
      {
        id: 'ORD-2024-004',
        customerName: 'International Spice Co',
        customerEmail: 'orders@intlspice.com',
        customerPhone: '+91 9876543213',
        items: [
          { batchId: 'BATCH-001', grade: 'Premium', quantity: 200, price: 1200 }
        ],
        totalAmount: 240000,
        status: 'Shipped',
        orderDate: '2024-01-15',
        expectedDelivery: '2024-01-20',
        shippingAddress: '321 International Plaza, Bangalore, Karnataka',
        paymentStatus: 'Paid',
        priority: 'High'
      }
    ];
    setOrders(mockOrders);
  };

  const filterOrders = () => {
    let filtered = orders;

    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status.toLowerCase() === activeTab.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': '#ff9800',
      'Processing': '#2196f3',
      'Ready to Ship': '#4caf50',
      'Shipped': '#9c27b0',
      'Delivered': '#607d8b',
      'Cancelled': '#f44336'
    };
    return colors[status] || '#666';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': '#f44336',
      'Medium': '#ff9800',
      'Low': '#4caf50'
    };
    return colors[priority] || '#666';
  };

  const handleOrderAction = (order, action) => {
    switch (action) {
      case 'view':
        setSelectedOrder(order);
        break;
      case 'process':
        updateOrderStatus(order.id, 'Processing');
        break;
      case 'ship':
        updateOrderStatus(order.id, 'Ready to Ship');
        break;
      case 'complete':
        updateOrderStatus(order.id, 'Shipped');
      default:
        break;
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    // In a real app, this would be an API call
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      // If order is being accepted, add to hub network
      if (newStatus === 'Accepted') {
        const acceptedOrder = updatedOrders.find(order => order.id === orderId);
        if (acceptedOrder) {
          addAcceptedRequest({
            ...acceptedOrder,
            acceptedDate: new Date().toISOString(),
            hubDistrict: hubData.district
          });
        }
      }
      
      return updatedOrders;
    });
    
    addNotification({
      type: 'success',
      title: 'Order Updated',
      message: `Order ${orderId} status updated to ${newStatus}`
    });
  };

  const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Order Details - {order.id}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="order-detail-grid">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <div className="detail-row">
                  <span>Name:</span>
                  <strong>{order.customerName}</strong>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <strong>{order.customerEmail}</strong>
                </div>
                <div className="detail-row">
                  <span>Phone:</span>
                  <strong>{order.customerPhone}</strong>
                </div>
                <div className="detail-row">
                  <span>Address:</span>
                  <strong>{order.shippingAddress}</strong>
                </div>
              </div>

              <div className="detail-section">
                <h4>Order Information</h4>
                <div className="detail-row">
                  <span>Order Date:</span>
                  <strong>{new Date(order.orderDate).toLocaleDateString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Expected Delivery:</span>
                  <strong>{new Date(order.expectedDelivery).toLocaleDateString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Priority:</span>
                  <span className="priority-badge" style={{ backgroundColor: getPriorityColor(order.priority) }}>
                    {order.priority}
                  </span>
                </div>
              </div>

              <div className="detail-section full-width">
                <h4>Order Items</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Grade</th>
                      <th>Quantity</th>
                      <th>Price/kg</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.batchId}</td>
                        <td>{item.grade}</td>
                        <td>{item.quantity} kg</td>
                        <td>₹{item.price.toLocaleString()}</td>
                        <td>₹{(item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2"><strong>Total</strong></td>
                      <td><strong>{totalQuantity} kg</strong></td>
                      <td></td>
                      <td><strong>₹{order.totalAmount.toLocaleString()}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="detail-section">
                <h4>Payment Information</h4>
                <div className="detail-row">
                  <span>Payment Status:</span>
                  <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Total Amount:</span>
                  <strong>₹{order.totalAmount.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            {order.status === 'Pending' && (
              <button className="btn-primary" onClick={() => handleOrderAction(order, 'process')}>
                Start Processing
              </button>
            )}
            {order.status === 'Processing' && (
              <button className="btn-primary" onClick={() => handleOrderAction(order, 'ship')}>
                Mark Ready to Ship
              </button>
            )}
            {order.status === 'Ready to Ship' && (
              <button className="btn-primary" onClick={() => handleOrderAction(order, 'complete')}>
                Mark as Shipped
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'Pending').length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'Processing').length },
    { id: 'ready to ship', label: 'Ready to Ship', count: orders.filter(o => o.status === 'Ready to Ship').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length }
  ];

  return (
    <div className="hub-orders">
      {/* Header */}
      <div className="orders-header">
        <div className="header-left">
          <h2>Order Management</h2>
          <p>Process and track customer orders</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">Export Orders</button>
          <button className="btn-primary">+ New Order</button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="order-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{orders.filter(o => o.status === 'Pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-info">
            <h3>{orders.filter(o => o.status === 'Processing').length}</h3>
            <p>Processing</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>₹{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</h3>
            <p>Total Value</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="order-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="orders-search">
        <input
          type="text"
          placeholder="Search orders by ID or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Orders List */}
      <div className="orders-list">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-id">
                <strong>{order.id}</strong>
                <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="order-badges">
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(order.priority) }}>
                  {order.priority}
                </span>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="order-body">
              <div className="order-customer">
                <h4>{order.customerName}</h4>
                <p>{order.customerEmail}</p>
              </div>
              
              <div className="order-items">
                <p><strong>Items:</strong> {order.items.length} batch(es)</p>
                <p><strong>Total Quantity:</strong> {order.items.reduce((sum, item) => sum + item.quantity, 0)} kg</p>
              </div>
              
              <div className="order-amount">
                <h3>₹{order.totalAmount.toLocaleString()}</h3>
                <p className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                  {order.paymentStatus}
                </p>
              </div>
            </div>
            
            <div className="order-footer">
              <div className="order-delivery">
                <span>Expected Delivery: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
              </div>
              <div className="order-actions">
                <button 
                  className="btn-icon" 
                  title="View Details"
                  onClick={() => handleOrderAction(order, 'view')}
                >
                  👁️
                </button>
                {order.status === 'Pending' && (
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => handleOrderAction(order, 'process')}
                  >
                    Start Processing
                  </button>
                )}
                {order.status === 'Processing' && (
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => handleOrderAction(order, 'ship')}
                  >
                    Ready to Ship
                  </button>
                )}
                {order.status === 'Ready to Ship' && (
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => handleOrderAction(order, 'complete')}
                  >
                    Mark Shipped
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}
