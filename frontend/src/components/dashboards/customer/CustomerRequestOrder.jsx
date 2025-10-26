import React, { useState } from "react";
import "../../../css/CustomerDashboard.css";
import "../../../css/RequestOrder.css";
import { createOrderRequest } from "../../../services/api";

export default function CustomerRequestOrder({ user }) {
  const [formData, setFormData] = useState({
    productType: "Cardamom",
    quantity: "",
    grade: "",
    description: "",
    urgency: "normal",
    budgetMin: "",
    budgetMax: "",
    preferredHub: "",
    contactPhone: user?.phone || "",
    contactEmail: user?.email || "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const hubs = [
    { id: 1, name: "Kumily Cardamom Hub", district: "Idukki" },
    { id: 2, name: "Wayanad Spice Center", district: "Wayanad" },
    { id: 3, name: "Kochi Export Terminal", district: "Ernakulam" },
    { id: 4, name: "Palakkad Processing Hub", district: "Palakkad" },
    { id: 5, name: "Thiruvananthapuram Distribution Center", district: "Thiruvananthapuram" },
    { id: 6, name: "Kozhikode Spice Hub", district: "Kozhikode" },
    { id: 7, name: "Thrissur Cardamom Center", district: "Thrissur" },
    { id: 8, name: "Kollam Coastal Hub", district: "Kollam" },
    { id: 9, name: "Alappuzha Spice Terminal", district: "Alappuzha" },
    { id: 10, name: "Kottayam Central Hub", district: "Kottayam" },
    { id: 11, name: "Pathanamthitta Hills Hub", district: "Pathanamthitta" },
    { id: 12, name: "Malappuram Spice Center", district: "Malappuram" },
    { id: 13, name: "Kannur Coastal Hub", district: "Kannur" },
    { id: 14, name: "Kasaragod Border Hub", district: "Kasaragod" }
  ];

  const grades = ["A Grade", "B Grade", "C Grade", "Mixed", "Any"];
  const urgencies = [
    { value: "normal", label: "Normal (7-14 days)" },
    { value: "urgent", label: "Urgent (3-7 days)" },
    { value: "immediate", label: "Immediate (1-3 days)" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (!formData.grade) {
      newErrors.grade = "Grade selection is required";
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.budgetMin || parseFloat(formData.budgetMin) <= 0) {
      newErrors.budgetMin = "Minimum budget is required";
    }

    if (!formData.budgetMax || parseFloat(formData.budgetMax) <= 0) {
      newErrors.budgetMax = "Maximum budget is required";
    }

    if (formData.budgetMin && formData.budgetMax && parseFloat(formData.budgetMin) > parseFloat(formData.budgetMax)) {
      newErrors.budgetMax = "Maximum budget must be greater than minimum";
    }

    if (!formData.preferredHub) {
      newErrors.preferredHub = "Please select a preferred hub";
    }

    if (!formData.contactPhone.trim() || !/^\d{10,15}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "Valid phone number is required (10-15 digits)";
    }

    if (!formData.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Valid email is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(false);
    setErrors({});

    try {
      console.log("Submitting order request with data:", formData);
      
      // Call the API to create order request
      const response = await createOrderRequest(formData);
      
      console.log("Order request submitted successfully:", response);
      
      setSubmitSuccess(true);
      
      // Reset form after 3 seconds to give user time to read success message
      setTimeout(() => {
        setFormData({
          productType: "Cardamom",
          quantity: "",
          grade: "",
          description: "",
          urgency: "normal",
          budgetMin: "",
          budgetMax: "",
          preferredHub: "",
          contactPhone: user?.phone || "",
          contactEmail: user?.email || "",
        });
        setSubmitSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error submitting order request:", error);
      const errorMessage = error?.message || "Failed to submit request. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="customer-request-order">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Request Custom Order</h2>
          <p>Can't find what you're looking for? Request a custom order from our farmers</p>
        </div>
        <div className="header-badge">📝 Custom Request</div>
      </div>

      {/* Info Cards */}
      <div className="info-cards-grid">
        <div className="info-card">
          <div className="info-icon">🌾</div>
          <div>
            <h4>Direct from Farmers</h4>
            <p>Your request will be sent to verified farmers in your region</p>
          </div>
        </div>
        <div className="info-card">
          <div className="info-icon">⚡</div>
          <div>
            <h4>Quick Response</h4>
            <p>Get quotes and availability within 24-48 hours</p>
          </div>
        </div>
        <div className="info-card">
          <div className="info-icon">💰</div>
          <div>
            <h4>Best Prices</h4>
            <p>Compare offers from multiple farmers and choose the best</p>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="request-form-container">
        <form onSubmit={handleSubmit} className="request-order-form">
          {submitSuccess && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <div>
                <strong>Request Submitted Successfully!</strong>
                <p>Your custom order request has been sent to hub managers. They will review your request and connect you with suitable farmers within 24-48 hours.</p>
                <p><small>📧 You'll receive email updates on your request status.</small></p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              {errors.submit}
            </div>
          )}

          <div className="form-section">
            <h3>Product Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productType">Product Type</label>
                <input
                  type="text"
                  id="productType"
                  name="productType"
                  value="Cardamom"
                  disabled
                  style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="grade">Grade *</label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && <span className="field-error">{errors.grade}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity (kg) *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  placeholder="Enter quantity in kg"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  step="0.1"
                  required
                />
                {errors.quantity && <span className="field-error">{errors.quantity}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="urgency">Urgency *</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  {urgencies.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Budget Range (₹ per kg) *</label>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="number"
                    id="budgetMin"
                    name="budgetMin"
                    placeholder="Min budget per kg"
                    value={formData.budgetMin}
                    onChange={handleChange}
                    min="0"
                    step="10"
                    required
                  />
                  {errors.budgetMin && <span className="field-error">{errors.budgetMin}</span>}
                </div>
                <div className="form-group">
                  <input
                    type="number"
                    id="budgetMax"
                    name="budgetMax"
                    placeholder="Max budget per kg"
                    value={formData.budgetMax}
                    onChange={handleChange}
                    min="0"
                    step="10"
                    required
                  />
                  {errors.budgetMax && <span className="field-error">{errors.budgetMax}</span>}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description & Requirements *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your requirements in detail (minimum 10 characters)"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3>Hub & Contact</h3>

            <div className="form-group">
              <label htmlFor="preferredHub">Preferred Hub *</label>
              <select
                id="preferredHub"
                name="preferredHub"
                value={formData.preferredHub}
                onChange={handleChange}
                required
              >
                <option value="">Select your preferred hub</option>
                {hubs.map(hub => (
                  <option key={hub.id} value={hub.name}>
                    {hub.name} ({hub.district})
                  </option>
                ))}
              </select>
              {errors.preferredHub && <span className="field-error">{errors.preferredHub}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactPhone">Contact Phone *</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="Your phone number"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                />
                {errors.contactPhone && <span className="field-error">{errors.contactPhone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">Contact Email *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  placeholder="Your email address"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                />
                {errors.contactEmail && <span className="field-error">{errors.contactEmail}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFormData({
                  productType: "Cardamom",
                  quantity: "",
                  grade: "",
                  description: "",
                  urgency: "normal",
                  budgetMin: "",
                  budgetMax: "",
                  preferredHub: "",
                  contactPhone: user?.phone || "",
                  contactEmail: user?.email || "",
                });
                setErrors({});
              }}
              disabled={submitting}
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="help-section">
          <h4>💡 How it works</h4>
          <ol>
            <li>Fill out the request form with your requirements</li>
            <li>Your request is sent to farmers matching your criteria</li>
            <li>Farmers review and send you quotes within 24-48 hours</li>
            <li>Compare offers and choose the best farmer</li>
            <li>Complete the order and track delivery</li>
          </ol>
          
          <div className="help-note">
            <strong>Note:</strong> All requests are reviewed to ensure quality and authenticity. 
            You'll receive notifications when farmers respond to your request.
          </div>
        </div>
      </div>
    </div>
  );
}
