import React, { useState, useEffect } from 'react';
import { getAllStates, getDistrictsForState } from '../../../data/indianStatesDistricts';
import { createHub, getAllHubs } from '../../../services/api';
import { useNotifications } from '../../../contexts/NotificationContext';

export default function HubManager() {
  const { addNotification } = useNotifications();
  
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    state: '',
    district: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    capacity: '',
    services: [],
    operatingHours: ''
  });
  
  const [states] = useState(getAllStates());
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState('');

  const serviceOptions = [
    'Storage', 'Processing', 'Packaging', 'Quality Testing', 'Transportation', 'Export Services'
  ];

  // Load hubs
  useEffect(() => {
    loadHubs();
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (form.state) {
      const stateDistricts = getDistrictsForState(form.state);
      setDistricts(stateDistricts);
    } else {
      setDistricts([]);
    }
  }, [form.state]);

  const loadHubs = async () => {
    try {
      setLoading(true);
      const hubData = await getAllHubs();
      setHubs(hubData);
    } catch (error) {
      console.error('Error loading hubs:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load hubs'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'services') {
      const updatedServices = checked 
        ? [...form.services, value]
        : form.services.filter(service => service !== value);
      setForm(prev => ({ ...prev, services: updatedServices }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      
      // Reset district when state changes
      if (name === 'state') {
        setForm(prev => ({ ...prev, district: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!form.name.trim() || !form.state || !form.district || !form.address.trim()) {
      setError('Name, state, district, and address are required');
      return;
    }

    try {
      setAdding(true);
      const hubData = {
        ...form,
        name: form.name.trim(),
        address: form.address.trim(),
        contactPerson: form.contactPerson.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : 0,
        operatingHours: form.operatingHours.trim() || undefined
      };

      const newHub = await createHub(hubData);
      setHubs(prev => [newHub, ...prev]);
      
      // Reset form
      setForm({
        name: '',
        state: '',
        district: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        capacity: '',
        services: [],
        operatingHours: ''
      });
      
      setShowForm(false);
      addNotification({
        type: 'success',
        title: 'Hub Created',
        message: `${newHub.name} has been successfully registered`
      });
    } catch (error) {
      const errorMessage = error?.message || 'Failed to create hub';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Hub Management</h3>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Hub'}
        </button>
      </div>
      
      <div className="card-content">
        {showForm && (
          <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#f9f9f9' }}>
            <h4>Register New Hub</h4>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div>
                <label>Hub Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Kumily Cardamom Hub"
                  required
                />
              </div>
              
              <div>
                <label>State *</label>
                <select name="state" value={form.state} onChange={handleChange} required>
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>District *</label>
                <select name="district" value={form.district} onChange={handleChange} disabled={!form.state} required>
                  <option value="">Select District</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Address *</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full address of the hub"
                  required
                  rows="2"
                />
              </div>
              
              <div>
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Manager name"
                />
              </div>
              
              <div>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Contact number"
                />
              </div>
              
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="hub@example.com"
                />
              </div>
              
              <div>
                <label>Capacity (kg)</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="Storage capacity"
                  min="0"
                />
              </div>
              
              <div>
                <label>Operating Hours</label>
                <input
                  type="text"
                  name="operatingHours"
                  value={form.operatingHours}
                  onChange={handleChange}
                  placeholder="e.g., 6:00 AM - 8:00 PM"
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Services Offered</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginTop: '8px' }}>
                  {serviceOptions.map(service => (
                    <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        name="services"
                        value={service}
                        checked={form.services.includes(service)}
                        onChange={handleChange}
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
              
              {error && (
                <div style={{ gridColumn: '1 / -1', color: '#c62828', fontSize: '14px' }}>
                  {error}
                </div>
              )}
              
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary" disabled={adding}>
                  {adding ? 'Creating...' : 'Create Hub'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div>
          <h4>Registered Hubs ({hubs.length})</h4>
          {loading ? (
            <p>Loading hubs...</p>
          ) : hubs.length === 0 ? (
            <p>No hubs registered yet. Add the first hub above.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
              {hubs.map(hub => (
                <div key={hub._id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', color: '#2e7d32' }}>{hub.name}</h5>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        📍 {hub.district}, {hub.state}
                      </p>
                    </div>
                    <span style={{ 
                      background: hub.isActive ? '#e8f5e8' : '#ffebee', 
                      color: hub.isActive ? '#2e7d32' : '#c62828',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {hub.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{hub.address}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '13px', color: '#666' }}>
                    {hub.contactPerson && <div>👤 {hub.contactPerson}</div>}
                    {hub.phone && <div>📞 {hub.phone}</div>}
                    {hub.email && <div>📧 {hub.email}</div>}
                    {hub.capacity > 0 && <div>📦 Capacity: {hub.capacity.toLocaleString()} kg</div>}
                    {hub.operatingHours && <div>🕒 {hub.operatingHours}</div>}
                  </div>
                  
                  {hub.services && hub.services.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#333' }}>Services: </strong>
                      <span style={{ fontSize: '13px', color: '#666' }}>
                        {hub.services.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
