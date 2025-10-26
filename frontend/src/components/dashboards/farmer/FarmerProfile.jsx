import React, { useEffect, useMemo, useState } from "react";
import { getAllStates, getDistrictsForState } from "../../../data/indianStatesDistricts";
import { getHubsByDistrict } from "../../../services/api";
import "../../../css/FarmerDashboard.css";

// Simple validators
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const isPhone = (v) => /^\d{7,15}$/.test((v || "").replace(/\D/g, ""));
const isUpiId = (v) => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test((v || "").trim());

export default function FarmerProfile({ user, onSave }) {
  // Load persisted profile if available
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("farmerProfile");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fullName: user?.profile?.fullName || user?.profileData?.fullName || user?.username || "Farmer",
      email: user?.email || "",
      phone: user?.phone || "",
      farmState: user?.profile?.farmState || user?.profileData?.farmState || "",
      farmDistrict: user?.profile?.farmDistrict || user?.profileData?.farmDistrict || "",
      profileImage: user?.profile?.profileImage || null,
    };
  });

  // Farm details
  const [farm, setFarm] = useState(() => {
    try {
      const saved = localStorage.getItem("farmerFarm");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      crops: ["Cardamom"], // demo default
      acreage: "", // in acres/hectares (free text)
      certifications: [], // e.g., Organic, GAP
    };
  });

  // Payments/Bank
  const [bank, setBank] = useState(() => {
    try {
      const saved = localStorage.getItem("farmerBank");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      bankName: "",
      accountNumber: "",
      ifsc: "",
      upiId: "",
    };
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [imagePreview, setImagePreview] = useState(profile.profileImage || null);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [states] = useState(getAllStates());
  const [districts, setDistricts] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loadingHubs, setLoadingHubs] = useState(false);

  useEffect(() => { setSuccessMsg(""); setErrorMsg(""); }, [isEditing, activeTab]);

  // Persist profile, farm, bank
  useEffect(() => {
    try { localStorage.setItem("farmerProfile", JSON.stringify(profile)); } catch {}
  }, [profile]);
  useEffect(() => {
    try { localStorage.setItem("farmerFarm", JSON.stringify(farm)); } catch {}
  }, [farm]);
  useEffect(() => {
    try { localStorage.setItem("farmerBank", JSON.stringify(bank)); } catch {}
  }, [bank]);

  // Keep form in sync with profile
  useEffect(() => {
    setForm({ ...profile });
    setImagePreview(profile.profileImage || null);
  }, [profile]);

  // Update districts when state changes
  useEffect(() => {
    if (form.farmState) {
      const stateDistricts = getDistrictsForState(form.farmState);
      setDistricts(stateDistricts);
    } else {
      setDistricts([]);
    }
  }, [form.farmState]);

  // Validation
  const validate = (data) => {
    const e = {};
    if (!data.fullName || data.fullName.trim().length < 3) e.fullName = "Full name must be at least 3 characters";
    if (!data.email || !isEmail(data.email)) e.email = "Enter a valid email";
    if (data.phone && !isPhone(data.phone)) e.phone = "Phone should be 7-15 digits";
    return e;
  };

  const bankIsValid = useMemo(() => {
    if (!bank.bankName && !bank.accountNumber && !bank.ifsc && !bank.upiId) return true; // optional
    if (bank.upiId) return isUpiId(bank.upiId);
    // If any bank fields present (non-UPI), minimally require bankName + accountNumber
    if ((bank.bankName || bank.accountNumber || bank.ifsc) && (!bank.bankName || !bank.accountNumber)) return false;
    return true;
  }, [bank]);

  const formIsValid = useMemo(() => Object.keys(validate(form)).length === 0, [form]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Reset district when state changes
    if (name === 'farmState') {
      setForm((prev) => ({ ...prev, farmState: value, farmDistrict: '' }));
      setHubs([]); // Clear hubs when state changes
    }
    
    // Update hubs when district changes
    if (name === 'farmDistrict' && value && form.farmState) {
      setLoadingHubs(true);
      try {
        const districtHubs = await getHubsByDistrict(form.farmState, value);
        setHubs(districtHubs);
      } catch (error) {
        console.error('Error fetching hubs:', error);
        setHubs([]);
      } finally {
        setLoadingHubs(false);
      }
    }
  };

  // Image upload with preview
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErrorMsg("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setForm((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.onerror = () => setErrorMsg("Failed to read image file");
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setForm((prev) => ({ ...prev, profileImage: null }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg(""); setErrorMsg("");
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0 || !bankIsValid) {
      if (!bankIsValid) setErrorMsg("Please verify bank or UPI details");
      return;
    }
    try {
      setSaving(true);
      // TODO: Integrate with backend when endpoint is available
      // await api.updateFarmerProfile({ profile: form, farm, bank })
      await new Promise((r) => setTimeout(r, 600));
      setProfile({ ...form });
      setIsEditing(false);
      setSuccessMsg("Profile updated successfully.");
      if (onSave) onSave({ profile: { ...form }, farm: { ...farm }, bank: { ...bank } });
    } catch (err) {
      setErrorMsg(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ ...profile });
    setImagePreview(profile.profileImage || null);
    setErrors({});
    setIsEditing(false);
  };

  // Helpers to edit farm arrays from comma separated inputs
  const handleFarmChange = (e) => {
    const { name, value } = e.target;
    setFarm((prev) => ({ ...prev, [name]: value }));
  };
  const handleCropsChange = (e) => {
    const raw = e.target.value;
    const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
    setFarm((prev) => ({ ...prev, crops: arr }));
  };
  const handleCertsChange = (e) => {
    const raw = e.target.value;
    const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
    setFarm((prev) => ({ ...prev, certifications: arr }));
  };

  const cropsCsv = farm.crops?.join(", ") || "";
  const certsCsv = farm.certifications?.join(", ") || "";

  return (
    <div className="farmer-profile">
      {/* Hero/Header */}
      <div className="profile-header fancy-green">
        <div className="profile-header-left">
          <div className="profile-avatar">
            {imagePreview ? (
              <img src={imagePreview} alt={profile.fullName} />
            ) : profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.fullName} />
            ) : (
              <div className="avatar-placeholder">
                {profile.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "F"}
              </div>
            )}
          </div>
          <div className="profile-title">
            <h2>{profile.fullName}</h2>
            <p>{user?.username || "farmer"} • Farmer</p>
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
          className={`profile-tab ${activeTab === "farm" ? "active" : ""}`}
          onClick={() => setActiveTab("farm")}
        >
          Farm Details
        </button>
        <button
          className={`profile-tab ${activeTab === "payment" ? "active" : ""}`}
          onClick={() => setActiveTab("payment")}
        >
          Bank & Payments
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
              <form onSubmit={handleSave} className="edit-profile-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={form.fullName}
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
                    value={form.email}
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
                    value={form.phone}
                    onChange={handleChange}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                  />
                  {errors.phone && <span className="field-error" id="err-phone">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="farmState">Farm State</label>
                  <select
                    id="farmState"
                    name="farmState"
                    value={form.farmState}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="farmDistrict">Farm District</label>
                  <select
                    id="farmDistrict"
                    name="farmDistrict"
                    value={form.farmDistrict}
                    onChange={handleChange}
                    disabled={!form.farmState}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
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
                    disabled={!formIsValid || !bankIsValid || saving}
                    title={!bankIsValid ? "Fix bank/UPI fields in Bank & Payments tab" : ""}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancel} disabled={saving}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="profile-details card-white">
                <div className="detail-row"><span>Name</span><strong>{profile.fullName || "—"}</strong></div>
                <div className="detail-row"><span>Email</span><strong>{profile.email || "—"}</strong></div>
                <div className="detail-row"><span>Phone</span><strong>{profile.phone || "—"}</strong></div>
                <div className="detail-row"><span>Farm State</span><strong>{profile.farmState || "—"}</strong></div>
                <div className="detail-row"><span>Farm District</span><strong>{profile.farmDistrict || "—"}</strong></div>
                <div className="form-actions">
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Farm Details */}
        {activeTab === "farm" && (
          <div className="farm-info">
            <div className="dashboard-card">
              <div className="card-header"><h3>Farm Details</h3></div>
              <div className="card-content">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="crops">Crops</label>
                    <input id="crops" placeholder="e.g., Cardamom, Pepper" value={cropsCsv} onChange={handleCropsChange} />
                    <small className="hint">Comma-separated list</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="acreage">Acreage</label>
                    <input id="acreage" name="acreage" placeholder="e.g., 2 acres" value={farm.acreage} onChange={handleFarmChange} />
                    <small className="hint">Free text (acres/hectares)</small>
                  </div>
                  <div className="form-group col-span-2">
                    <label htmlFor="certifications">Certifications</label>
                    <input id="certifications" placeholder="e.g., Organic, GAP" value={certsCsv} onChange={handleCertsChange} />
                    <small className="hint">Comma-separated list</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank & Payments */}
        {activeTab === "payment" && (
          <div className="payment-info">
            <div className="dashboard-card">
              <div className="card-header"><h3>Bank & Payments</h3></div>
              <div className="card-content">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="bankName">Bank Name</label>
                    <input id="bankName" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="accountNumber">Account Number</label>
                    <input id="accountNumber" value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ifsc">IFSC</label>
                    <input id="ifsc" value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="upiId">UPI ID</label>
                    <input id="upiId" placeholder="name@bank" value={bank.upiId} onChange={(e) => setBank({ ...bank, upiId: e.target.value })} />
                    {bank.upiId && !isUpiId(bank.upiId) && <span className="field-error">Enter a valid UPI ID</span>}
                  </div>
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={(e) => { e.preventDefault(); setSuccessMsg("Bank details saved locally."); }} disabled={!bankIsValid}>Save Bank Details</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="security-info">
            <div className="dashboard-card">
              <div className="card-header"><h3>Security Settings</h3></div>
              <div className="card-content">
                <form className="form-grid-2" onSubmit={(e) => { e.preventDefault(); setSuccessMsg("Password change request submitted (demo)"); }}>
                  <div className="form-group">
                    <label htmlFor="currPass">Current Password</label>
                    <input id="currPass" type="password" placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPass">New Password</label>
                    <input id="newPass" type="password" placeholder="Strong password" />
                  </div>
                  <div className="form-group col-span-2">
                    <label htmlFor="newPass2">Confirm New Password</label>
                    <input id="newPass2" type="password" placeholder="Repeat new password" />
                  </div>
                  <div className="form-actions">
                    <button className="save-btn" type="submit">Update Password</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}