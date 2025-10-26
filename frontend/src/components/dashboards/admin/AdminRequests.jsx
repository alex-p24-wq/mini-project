import React, { useState, useEffect } from "react";
import "../../../css/HubDashboard.css";
import "../../../css/HubRequests.css";
import { getAdminOrderRequests, updateOrderRequestStatus } from "../../../services/api";

export default function AdminRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, rejected
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch requests from API
  useEffect(() => {
    fetchRequests();
    
    // Set up auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing admin requests...');
      fetchRequests();
    }, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('🔍 Fetching admin requests...');
      const response = await getAdminOrderRequests({ limit: 100 });
      console.log('📊 Admin requests response:', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        console.log('✅ Found', response.data.length, 'requests');
        
        const fetchedRequests = response.data.map(req => ({
          id: req._id,
          customerName: req.customerName,
          customerEmail: req.customerEmail,
          customerPhone: req.customerPhone,
          productType: req.productType,
          grade: req.grade,
          quantity: req.quantity,
          budgetMin: req.budgetMin,
          budgetMax: req.budgetMax,
          urgency: req.urgency,
          preferredHub: req.preferredHub,
          description: req.description,
          status: req.status,
          createdAt: req.createdAt,
          hubResponse: req.hubResponse
        }));
        
        setRequests(fetchedRequests);
      } else {
        setRequests([]);
        console.log('No requests found');
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(error?.message || 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setSuccess('Refreshed successfully!');
    setTimeout(() => setSuccess(""), 3000);
    setRefreshing(false);
  };

  // Handle status update
  const handleStatusUpdate = async (requestId, newStatus, message) => {
    try {
      await updateOrderRequestStatus(requestId, newStatus, message);
      setSuccess(`Request ${newStatus} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
      await fetchRequests(); // Refresh list
      setExpandedRequest(null); // Close modal
    } catch (error) {
      console.error("Error updating request:", error);
      setError(error?.message || 'Failed to update request');
      setTimeout(() => setError(""), 5000);
    }
  };

  // Filter requests based on selected filter
  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#ff9800";
      case "accepted": return "#4caf50";
      case "rejected": return "#f44336";
      case "completed": return "#2196f3";
      default: return "#9e9e9e";
    }
  };

  return (
    <div className="hub-requests">
      {/* Header */}
      <div className="page-header" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
        <div>
          <h2>Customer Product Requests</h2>
          <p>Manage custom order requests from customers • Auto-refreshes every 60s</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleManualRefresh}
            disabled={refreshing}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {refreshing ? '🔄' : '↻'} {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="header-badge">{filteredRequests.length} Requests</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', margin: '16px 0' }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#e8f5e8', color: '#2e7d32', padding: '12px', borderRadius: '6px', margin: '16px 0' }}>
          ✅ {success}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { id: "all", label: "All", count: requests.length },
          { id: "pending", label: "Pending", count: requests.filter(r => r.status === 'pending').length },
          { id: "accepted", label: "Accepted", count: requests.filter(r => r.status === 'accepted').length },
          { id: "rejected", label: "Rejected", count: requests.filter(r => r.status === 'rejected').length },
          { id: "completed", label: "Completed", count: requests.filter(r => r.status === 'completed').length }
        ].map(tab => (
          <button
            key={tab.id}
            className={`filter-tab ${filter === tab.id ? 'active' : ''}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label} <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="requests-container">
        {loading && requests.length === 0 ? (
          <div className="loading-state">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No {filter !== 'all' ? filter : ''} requests found</h3>
            <p>Customer product requests will appear here</p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div>
                    <h3>{request.customerName}</h3>
                    <p className="customer-contact">
                      📧 {request.customerEmail} • 📞 {request.customerPhone}
                    </p>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ 
                      background: getStatusColor(request.status),
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="request-details">
                  <div className="detail-row">
                    <span className="detail-label">Product:</span>
                    <span className="detail-value">{request.productType} - {request.grade} Grade</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{request.quantity} kg</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Budget:</span>
                    <span className="detail-value">₹{request.budgetMin} - ₹{request.budgetMax}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Urgency:</span>
                    <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                      {request.urgency === 'high' ? '🔴' : request.urgency === 'medium' ? '🟡' : '🟢'} {request.urgency}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Preferred Hub:</span>
                    <span className="detail-value">{request.preferredHub}</span>
                  </div>
                  <div className="detail-row full-width">
                    <span className="detail-label">Description:</span>
                    <p className="detail-description">{request.description}</p>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Requested:</span>
                    <span className="detail-value">{new Date(request.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button 
                      className="btn-accept"
                      onClick={() => setExpandedRequest(request.id)}
                    >
                      ✅ Accept
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleStatusUpdate(request.id, 'rejected', 'Request rejected by administrator')}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {request.hubResponse && (
                  <div className="hub-response">
                    <strong>Response:</strong> {request.hubResponse.message}
                    <br />
                    <small>Responded at: {new Date(request.hubResponse.respondedAt).toLocaleString()}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accept Request Modal */}
      {expandedRequest && (
        <div className="modal-overlay" onClick={() => setExpandedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Accept Request</h3>
            <p>Are you sure you want to accept this customer request?</p>
            <div className="modal-actions">
              <button 
                className="btn-accept"
                onClick={() => handleStatusUpdate(expandedRequest, 'accepted', 'Request accepted. We will process your order.')}
              >
                Confirm Accept
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setExpandedRequest(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
