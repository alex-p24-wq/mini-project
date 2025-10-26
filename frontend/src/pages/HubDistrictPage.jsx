import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHubActivitiesByDistrict, getHubsByDistrict, generateHubArrivalOTP, verifyHubArrivalOTP } from "../services/api";

export default function HubDistrictPage() {
  const navigate = useNavigate();
  const { district } = useParams();
  const [activities, setActivities] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [otpModal, setOtpModal] = useState({ show: false, activityId: null, step: 'generate' });
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Assuming state is Kerala as per hub selection flow
        const [acts, hubsRes] = await Promise.all([
          getHubActivitiesByDistrict("Kerala", district),
          getHubsByDistrict("Kerala", district)
        ]);
        setActivities(Array.isArray(acts?.items) ? acts.items : []);
        setHubs(Array.isArray(hubsRes) ? hubsRes : (Array.isArray(hubsRes?.data) ? hubsRes.data : []));
      } catch (e) {
        setError(e?.message || "Failed to load district data");
        setActivities([]);
        setHubs([]);
      } finally {
        setLoading(false);
      }
    };
    if (district) load();
  }, [district]);

  const stats = useMemo(() => {
    const totalHubs = hubs.length;
    const totalSales = activities.length;
    const totalRevenue = activities.reduce((sum, a) => sum + (a.amount || 0), 0);
    const lastSale = activities[0]?.createdAt ? new Date(activities[0].createdAt) : null;
    return { totalHubs, totalSales, totalRevenue, lastSale };
  }, [hubs, activities]);

  const titleCase = (s) => (s || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const districtTitle = titleCase(decodeURIComponent(district || ""));

  const handleGenerateOTP = async (activityId) => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Show login prompt
      const shouldLogin = window.confirm(
        'You need to login as a Hub Manager or Farmer to confirm product arrival.\n\n' +
        'Click OK to go to login page.'
      );
      if (shouldLogin) {
        navigate('/login', { state: { from: `/hub/district/${district}` } });
      }
      return;
    }
    
    setOtpModal({ show: true, activityId, step: 'generate' });
    setOtpError('');
    setOtpSuccess('');
    setOtpLoading(true);
    setGeneratedOTP('');
    
    try {
      const result = await generateHubArrivalOTP(activityId);
      setOtpSuccess(result.message || 'OTP sent to your email successfully!');
      setOtpModal({ show: true, activityId, step: 'verify', email: result.email });
    } catch (err) {
      setOtpError(err.message || 'Failed to send OTP');
      setOtpModal({ show: false, activityId: null, step: 'generate' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpInput.trim()) {
      setOtpError('Please enter OTP');
      return;
    }
    
    setOtpLoading(true);
    setOtpError('');
    
    try {
      const result = await verifyHubArrivalOTP(otpModal.activityId, otpInput);
      setOtpSuccess(result.message || 'Product arrival confirmed!');
      
      // Refresh activities
      const acts = await getHubActivitiesByDistrict("Kerala", district);
      setActivities(Array.isArray(acts?.items) ? acts.items : []);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setOtpModal({ show: false, activityId: null, step: 'generate' });
        setOtpInput('');
        setOtpError('');
        setOtpSuccess('');
        setGeneratedOTP('');
      }, 2000);
    } catch (err) {
      setOtpError(err.message || 'Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const closeOtpModal = () => {
    setOtpModal({ show: false, activityId: null, step: 'generate' });
    setOtpInput('');
    setOtpError('');
    setOtpSuccess('');
    setGeneratedOTP('');
  };

  return (
    <div style={{ padding: '16px', display: 'grid', gap: 12, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', minHeight: '100vh' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
        color: 'white',
        padding: '14px 16px',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
      }}>
        <div>
          <div style={{ opacity: 0.9, fontSize: 11, fontWeight: 500 }}>Kerala • Hub Network</div>
          <h2 style={{ margin: '4px 0 0 0', fontSize: 20 }}>{districtTitle}</h2>
          <div style={{ marginTop: 4, fontSize: 11, opacity: 0.9 }}>Live overview of hubs and recent sales</div>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '6px 12px', border: '1px solid rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 0.2s' }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
        >
          ← Back
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <div style={{ background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Hubs</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{loading ? '—' : stats.totalHubs}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{loading ? '—' : stats.totalSales}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>₹{loading ? '—' : stats.totalRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Sale</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{loading ? '—' : (stats.lastSale ? new Date(stats.lastSale).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No sales')}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 12 }}>
        {/* Hubs Grid */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #fafafa 0%, #f9fafb 100%)' }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: 13, fontWeight: 700 }}>🏢 Active Hubs</h3>
            <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{hubs.length} hubs</span>
          </div>
          <div style={{ padding: 10, maxHeight: 500, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 60, borderRadius: 6, background: 'linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : hubs.length === 0 ? (
              <div style={{ padding: 20, color: '#6b7280', textAlign: 'center', fontSize: 12 }}>No hubs found in {districtTitle}.</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {hubs.map((h) => (
                  <div key={h._id || h.id} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px', background: '#ffffff', transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                    onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                        <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.address}</div>
                      </div>
                      <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 999, background: '#ecfdf5', color: '#065f46', border: '1px solid #d1fae5', fontWeight: 600, flexShrink: 0 }}>Active</span>
                    </div>
                    {h.contactPerson && (
                      <div style={{ marginTop: 6, fontSize: 9, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>👤 {h.contactPerson}{h.phone ? ` • ${h.phone}` : ''}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sold Products */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #fafafa 0%, #f9fafb 100%)' }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: 13, fontWeight: 700 }}>📦 Recent Sales</h3>
            <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{activities.length} transactions</span>
          </div>
          <div style={{ padding: 10, display: 'grid', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: 80, borderRadius: 6, background: 'linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))
            ) : activities.length === 0 ? (
              <div style={{ padding: 20, color: '#6b7280', textAlign: 'center', fontSize: 12 }}>No sales recorded yet.</div>
            ) : (
              activities.map((a) => {
                const isExpanded = expandedActivity === a._id;
                const productName = a.product?.name || 'Unknown Product';
                const productId = typeof a.product === 'object' ? a.product._id : a.product;
                const farmerName = a.farmer?.name || 'Unknown Farmer';
                const farmerEmail = a.farmer?.email || '';
                const farmerPhone = a.farmer?.phone || '';
                const customerName = a.customer?.name || 'Unknown Customer';
                const customerEmail = a.customer?.email || '';
                const customerPhone = a.customer?.phone || '';
                
                return (
                  <div key={a._id} style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 6, 
                    padding: '8px 10px', 
                    background: '#ffffff',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                    onClick={() => setExpandedActivity(isExpanded ? null : a._id)}
                    onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                    onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {productName} {a.product?.grade && <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 500 }}>({a.product.grade})</span>}
                        </div>
                        <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2, fontFamily: 'monospace' }}>
                          ID: {String(productId).slice(-8)}
                          {a.hubArrivalConfirmed && (
                            <span style={{ marginLeft: 6, fontSize: 8, padding: '2px 5px', borderRadius: 3, background: '#10b981', color: 'white', fontWeight: 600 }}>✓ Confirmed</span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>₹{(a.amount || 0).toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: 8, color: '#6b7280', marginTop: 1 }}>{a.quantity ? `${a.quantity} kg` : ''}</div>
                      </div>
                    </div>

                    {/* OTP Confirmation Button */}
                    {!a.hubArrivalConfirmed && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateOTP(a._id);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 5,
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          {isAuthenticated() ? '📧 Send OTP to Farmer & Confirm Arrival' : '🔒 Login to Confirm Arrival'}
                        </button>
                        <div style={{ marginTop: 4, fontSize: 8, color: '#6b7280', textAlign: 'center', fontStyle: 'italic' }}>
                          {isAuthenticated() ? 'OTP will be sent to farmer\'s email' : 'Hub Manager or Farmer login required'}
                        </div>
                      </div>
                    )}

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                        {/* Farmer Details */}
                        <div style={{ marginBottom: 6, padding: '6px 8px', background: '#f0fdf4', borderRadius: 4, border: '1px solid #d1fae5' }}>
                          <div style={{ fontSize: 8, color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>👨‍🌾 Farmer</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#111827' }}>{farmerName}</div>
                          {farmerEmail && <div style={{ fontSize: 8, color: '#6b7280', marginTop: 1 }}>📧 {farmerEmail}</div>}
                          {farmerPhone && <div style={{ fontSize: 8, color: '#6b7280', marginTop: 1 }}>📱 {farmerPhone}</div>}
                        </div>

                        {/* Customer Details */}
                        <div style={{ marginBottom: 6, padding: '6px 8px', background: '#eff6ff', borderRadius: 4, border: '1px solid #dbeafe' }}>
                          <div style={{ fontSize: 8, color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>👤 Customer</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#111827' }}>{customerName}</div>
                          {customerEmail && <div style={{ fontSize: 8, color: '#6b7280', marginTop: 1 }}>📧 {customerEmail}</div>}
                          {customerPhone && <div style={{ fontSize: 8, color: '#6b7280', marginTop: 1 }}>📱 {customerPhone}</div>}
                        </div>

                        {/* Order Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 8 }}>
                          <div style={{ padding: '4px 6px', background: '#fafafa', borderRadius: 3 }}>
                            <div style={{ color: '#6b7280', marginBottom: 2 }}>Order ID</div>
                            <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#374151', fontSize: 9 }}>{String(a.order).slice(-8)}</div>
                          </div>
                          <div style={{ padding: '4px 6px', background: '#fafafa', borderRadius: 3 }}>
                            <div style={{ color: '#6b7280', marginBottom: 2 }}>Date</div>
                            <div style={{ fontWeight: 600, color: '#374151', fontSize: 9 }}>
                              {new Date(a.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expand Indicator */}
                    <div style={{ textAlign: 'center', marginTop: 6, fontSize: 9, color: '#9ca3af', fontWeight: 600 }}>
                      {isExpanded ? '▲ Click to collapse' : '▼ Click for details'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
          onClick={closeOtpModal}
        >
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>
                🔐 Confirm Hub Arrival
              </h3>
              <button
                onClick={closeOtpModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 24,
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            {otpModal.step === 'generate' && otpLoading && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Generating OTP...</div>
              </div>
            )}

            {otpModal.step === 'verify' && (
              <div>
                {otpSuccess && (
                  <div style={{
                    background: '#d1fae5',
                    border: '1px solid #10b981',
                    borderRadius: 8,
                    padding: '12px',
                    marginBottom: 16,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
                      ✅ {otpSuccess}
                    </div>
                    {otpModal.email && (
                      <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>
                        📧 OTP sent to farmer's email: <strong>{otpModal.email}</strong>
                      </div>
                    )}
                  </div>
                )}

                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  A 6-digit OTP has been sent to the <strong>farmer's registered email</strong>. The farmer will provide you with the OTP. Enter it below to confirm that the product has arrived at the hub.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 16,
                      fontFamily: 'monospace',
                      letterSpacing: '4px',
                      textAlign: 'center',
                      fontWeight: 600
                    }}
                    autoFocus
                  />
                </div>

                {otpError && (
                  <div style={{
                    background: '#fee2e2',
                    border: '1px solid #ef4444',
                    borderRadius: 6,
                    padding: '10px 12px',
                    marginBottom: 16,
                    fontSize: 12,
                    color: '#991b1b'
                  }}>
                    ❌ {otpError}
                  </div>
                )}

                {otpSuccess && (
                  <div style={{
                    background: '#d1fae5',
                    border: '1px solid #10b981',
                    borderRadius: 6,
                    padding: '10px 12px',
                    marginBottom: 16,
                    fontSize: 12,
                    color: '#065f46'
                  }}>
                    ✅ {otpSuccess}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={closeOtpModal}
                    disabled={otpLoading}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#374151',
                      cursor: otpLoading ? 'not-allowed' : 'pointer',
                      opacity: otpLoading ? 0.5 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={otpLoading || !otpInput.trim()}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: otpLoading || !otpInput.trim() ? '#9ca3af' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'white',
                      cursor: otpLoading || !otpInput.trim() ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {otpLoading ? 'Verifying...' : 'Verify & Confirm'}
                  </button>
                </div>

                <div style={{ marginTop: 16, padding: '12px', background: '#fef3c7', borderRadius: 6, border: '1px solid #fbbf24' }}>
                  <div style={{ fontSize: 11, color: '#92400e', marginBottom: 6 }}>
                    <strong>📋 Process:</strong>
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 10, color: '#92400e', lineHeight: 1.6 }}>
                    <li>OTP sent to farmer's email</li>
                    <li>Farmer shares OTP with hub manager</li>
                    <li>Hub manager enters OTP here</li>
                    <li>Customer gets automatic email notification</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shimmer animation keyframes */}
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
