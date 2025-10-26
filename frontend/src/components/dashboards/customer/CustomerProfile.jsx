import React, { useEffect, useMemo, useState } from "react";
import "../../../css/CustomerDashboard.css";

// Simple validators
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^\d{7,15}$/.test(v);
const isZip = (v) => /^\d{4,10}$/.test(v || "");
const isUpiId = (v) => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test((v || "").trim());

export default function CustomerProfile({ user }) {
  // Base profile data (prefill from user if available; load from localStorage if present)
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('customerProfile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore parse errors
    }
    return {
      fullName: user?.profile?.fullName || user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.profile?.address || "",
      alternatePhone: user?.profile?.alternatePhone || "",
      profileImage: user?.profile?.profileImage || null, // data URL or absolute path
    };
  });
  const [formData, setFormData] = useState({ ...profileData });
  const [imagePreview, setImagePreview] = useState(profileData.profileImage || null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Reset messages when toggle edit
    setSuccessMsg("");
    setErrorMsg("");
  }, [isEditing]);

  // Persist profile to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('customerProfile', JSON.stringify(profileData));
    } catch (_) {
      // ignore quota or serialization errors
    }
  }, [profileData]);

  const validate = (data) => {
    const e = {};
    if (!data.fullName || data.fullName.trim().length < 3) e.fullName = "Full name must be at least 3 characters";
    if (!data.email || !isEmail(data.email)) e.email = "Enter a valid email";
    if (data.phone && !isPhone(data.phone)) e.phone = "Phone should be 7-15 digits";
    if (data.alternatePhone && !isPhone(data.alternatePhone)) e.alternatePhone = "Alternate phone should be 7-15 digits";
    if (data.address && data.address.trim().length < 5) e.address = "Address is too short";
    return e;
  };

  // Validate addresses set
  const validateAddresses = (arr) => arr.every((a) => a.line1 && a.line1.trim().length >= 5 && (!a.zip || isZip(a.zip)));

  // Validate payment methods set
  const validatePayments = (arr) => arr.every((p) => (p.type === 'UPI' ? isUpiId(p.upiId) : true));

  const formIsValid = useMemo(() => Object.keys(validate(formData)).length === 0, [formData]);

  // Basic controlled input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Profile image upload with preview
  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file");
      return;
    }
    // Convert to data URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.onerror = () => setErrorMsg("Failed to read image file");
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, profileImage: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const v = validate(formData);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      setSaving(true);
      // TODO: Integrate with backend when endpoint is available, e.g.
      // await updateCustomerProfile({ profile: formData, addresses, paymentMethods })
      await new Promise((r) => setTimeout(r, 700));
      setProfileData({ ...formData });
      // also persist addresses and payment methods explicitly (already handled by effects but safe here)
      try {
        localStorage.setItem('customerAddresses', JSON.stringify(addresses));
        localStorage.setItem('customerPayments', JSON.stringify(paymentMethods));
      } catch {}
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      setErrorMsg(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setImagePreview(profileData.profileImage || null);
    setErrors({});
    setIsEditing(false);
  };

  // Keep form in sync if profileData changes (e.g., after reload or external updates)
  useEffect(() => {
    setFormData({ ...profileData });
    setImagePreview(profileData.profileImage || null);
  }, [profileData]);

  // Addresses state (persisted)
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('customerAddresses');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed with default from profile if available
    return profileData.address
      ? [{ id: 1, type: 'Home', line1: profileData.address, city: '', state: '', zip: '', isDefault: true }]
      : [];
  });
  useEffect(() => {
    try { localStorage.setItem('customerAddresses', JSON.stringify(addresses)); } catch {}
  }, [addresses]);

  // Payment methods state (persisted)
  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('customerPayments');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  useEffect(() => {
    try { localStorage.setItem('customerPayments', JSON.stringify(paymentMethods)); } catch {}
  }, [paymentMethods]);

  return (
    <div className="customer-profile">
      {/* Hero/Header */}
      <div className="profile-header fancy-green">
        <div className="profile-header-left">
          <div className="profile-avatar">
            {imagePreview ? (
              <img src={imagePreview} alt={profileData.fullName} />
            ) : profileData.profileImage ? (
              <img src={profileData.profileImage} alt={profileData.fullName} />
            ) : (
              <div className="avatar-placeholder">
                {profileData.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="profile-title">
            <h2>{profileData.fullName}</h2>
            <p>{user?.username || "user"} • Customer</p>
          </div>
        </div>
        <div className="profile-header-actions">
          {!isEditing ? (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          ) : (
            <label className="upload-btn">
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              Change Photo
            </label>
          )}
          {isEditing && imagePreview && (
            <button className="btn-ghost" onClick={removeImage}>Remove Photo</button>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && <div className="alert-success" role="status">✅ {successMsg}</div>}
      {errorMsg && <div className="alert-error" role="alert">⚠️ {errorMsg}</div>}

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Info
        </button>
        <button
          className={`profile-tab ${activeTab === "addresses" ? "active" : ""}`}
          onClick={() => setActiveTab("addresses")}
        >
          Addresses
        </button>
        <button
          className={`profile-tab ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          Payment Methods
        </button>
        <button
          className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
      </div>

      <div className="profile-content">
        {/* Personal Info */}
        {activeTab === "personal" && (
          <div className="personal-info">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="edit-profile-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "err-fullName" : undefined}
                    required
                  />
                  {errors.fullName && <span className="field-error" id="err-fullName">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "err-email" : undefined}
                    required
                  />
                  {errors.email && <span className="field-error" id="err-email">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="10 digit phone"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                  />
                  {errors.phone && <span className="field-error" id="err-phone">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="alternatePhone">Alternate Phone</label>
                  <input
                    type="tel"
                    id="alternatePhone"
                    name="alternatePhone"
                    placeholder="Optional"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    aria-invalid={!!errors.alternatePhone}
                    aria-describedby={errors.alternatePhone ? "err-alt" : undefined}
                  />
                  {errors.alternatePhone && <span className="field-error" id="err-alt">{errors.alternatePhone}</span>}
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="address">Default Address</label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    placeholder="Street, City, State, ZIP"
                    value={formData.address}
                    onChange={handleChange}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? "err-address" : undefined}
                  />
                  {errors.address && <span className="field-error" id="err-address">{errors.address}</span>}
                </div>

                <div className="form-group col-span-2">
                  <label>Profile Photo</label>
                  <div className="photo-actions">
                    <label className="upload-btn">
                      <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                      Upload Photo
                    </label>
                    {imagePreview && (
                      <button className="btn-ghost" type="button" onClick={removeImage}>Remove</button>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={!formIsValid || saving || !validateAddresses(addresses) || !validatePayments(paymentMethods)}
                    title={!validateAddresses(addresses) ? 'Fix address fields' : (!validatePayments(paymentMethods) ? 'Fix payment fields' : '')}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancel} disabled={saving}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="profile-details card-white">
                <div className="detail-group">
                  <h3>Full Name</h3>
                  <p>{profileData.fullName}</p>
                </div>
                <div className="detail-group">
                  <h3>Email</h3>
                  <p>{profileData.email}</p>
                </div>
                <div className="detail-group">
                  <h3>Phone</h3>
                  <p>{profileData.phone || "Not provided"}</p>
                </div>
                <div className="detail-group">
                  <h3>Alternate Phone</h3>
                  <p>{profileData.alternatePhone || "Not provided"}</p>
                </div>
                <div className="detail-group">
                  <h3>Default Address</h3>
                  <p>{profileData.address || "Not set"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Addresses */}
        {activeTab === "addresses" && (
          <div className="addresses-section card-white">
            <div className="section-header">
              <h3>Saved Addresses</h3>
              <button
                className="add-new-btn"
                onClick={() => {
                  const id = Date.now();
                  setAddresses((prev) => [
                    ...prev,
                    { id, type: 'Home', line1: '', city: '', state: '', zip: '', isDefault: prev.length === 0 },
                  ]);
                }}
              >
                + Add New Address
              </button>
            </div>
            <div className="addresses-list">
              {addresses.length === 0 && <p style={{color:'#607d8b'}}>No addresses saved yet.</p>}
              {addresses.map((a) => (
                <div className="address-card" key={a.id}>
                  <div className="address-header">
                    <h4>{a.type}</h4>
                    {a.isDefault && <span className="default-badge">Default</span>}
                  </div>
                  <div className="form-group">
                    <label>Address Line</label>
                    <input
                      type="text"
                      placeholder="Street, Area"
                      value={a.line1}
                      onChange={(e) => setAddresses((prev) => prev.map(x => x.id === a.id ? { ...x, line1: e.target.value } : x))}
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={a.city}
                      onChange={(e) => setAddresses((prev) => prev.map(x => x.id === a.id ? { ...x, city: e.target.value } : x))}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={a.state}
                      onChange={(e) => setAddresses((prev) => prev.map(x => x.id === a.id ? { ...x, state: e.target.value } : x))}
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP</label>
                    <input
                      type="text"
                      value={a.zip}
                      onChange={(e) => setAddresses((prev) => prev.map(x => x.id === a.id ? { ...x, zip: e.target.value } : x))}
                    />
                    {!isZip(a.zip) && a.zip && <span className="field-error">Enter a valid ZIP</span>}
                  </div>
                  <div className="address-actions">
                    {!a.isDefault && (
                      <button className="set-default-btn" onClick={() => setAddresses((prev) => prev.map(x => ({ ...x, isDefault: x.id === a.id })))}>Set as Default</button>
                    )}
                    <button className="edit-btn" onClick={() => setAddresses((prev) => prev.map(x => x.id === a.id ? { ...x, type: x.type === 'Home' ? 'Work' : 'Home' } : x))}>Toggle Type</button>
                    <button className="delete-btn" onClick={() => setAddresses((prev) => prev.filter(x => x.id !== a.id))}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment */}
        {activeTab === "payment" && (
          <div className="payment-section card-white">
            <div className="section-header">
              <h3>Payment Methods</h3>
              <button
                className="add-new-btn"
                onClick={() => {
                  const id = Date.now();
                  setPaymentMethods((prev) => [
                    ...prev,
                    { id, type: 'UPI', upiId: '', isDefault: prev.length === 0 },
                  ]);
                }}
              >
                + Add Payment Method
              </button>
            </div>
            <div className="payment-list">
              {paymentMethods.length === 0 && <p style={{color:'#607d8b'}}>No payment methods saved yet.</p>}
              {paymentMethods.map((pm) => (
                <div className="payment-card" key={pm.id}>
                  <div className="payment-header">
                    <h4>{pm.type}</h4>
                    {pm.isDefault && <span className="default-badge">Default</span>}
                  </div>
                  {pm.type === 'UPI' && (
                    <div className="form-group">
                      <label>UPI ID</label>
                      <input
                        type="text"
                        placeholder="example@upi"
                        value={pm.upiId}
                        onChange={(e) => setPaymentMethods((prev) => prev.map(x => x.id === pm.id ? { ...x, upiId: e.target.value } : x))}
                      />
                      {pm.upiId && !isUpiId(pm.upiId) && <span className="field-error">Enter a valid UPI ID</span>}
                    </div>
                  )}
                  <div className="payment-actions">
                    {!pm.isDefault && (
                      <button className="set-default-btn" onClick={() => setPaymentMethods((prev) => prev.map(x => ({ ...x, isDefault: x.id === pm.id })))}>Set as Default</button>
                    )}
                    <button className="edit-btn" onClick={() => setPaymentMethods((prev) => prev.map(x => x.id === pm.id ? { ...x, type: x.type === 'UPI' ? 'Card' : 'UPI' } : x))}>Toggle Type</button>
                    <button className="delete-btn" onClick={() => setPaymentMethods((prev) => prev.filter(x => x.id !== pm.id))}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="security-section card-white">
            <div className="section-header">
              <h3>Security Settings</h3>
            </div>
            <div className="security-options" style={{display:'grid', gap:12}}>
              <div className="security-card card-white">
                <h4>Change Password</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const current = form.currentPassword.value.trim();
                    const next = form.newPassword.value.trim();
                    const confirm = form.confirmPassword.value.trim();
                    if (!current || current.length < 6) return setErrorMsg('Current password is required (min 6 chars)');
                    if (!next || next.length < 8) return setErrorMsg('New password must be at least 8 characters');
                    if (!/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/\d/.test(next)) return setErrorMsg('New password must include upper, lower, and a number');
                    if (next === current) return setErrorMsg('New password must be different from current');
                    if (next !== confirm) return setErrorMsg('Password confirmation does not match');
                    setErrorMsg('');
                    setSuccessMsg('Password updated locally. Connect to backend to persist.');
                    form.reset();
                  }}
                  className="edit-profile-form"
                >
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input id="currentPassword" name="currentPassword" type="password" placeholder="••••••" required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input id="newPassword" name="newPassword" type="password" placeholder="At least 8 characters with A-z and 0-9" required minLength={8} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter new password" required minLength={8} />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-btn">Update Password</button>
                  </div>
                </form>
              </div>
              <div className="security-card card-white">
                <h4>Two-Factor Authentication</h4>
                <p>Secure your account with an extra verification step.</p>
                <button
                  className="enable-2fa-btn"
                  onClick={() => setSuccessMsg('2FA setup (demo). Integrate backend to enable authenticator/OTP.')}
                >Enable 2FA</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}