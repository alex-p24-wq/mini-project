// Simple, reusable client-side validators

export const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

export const validateUsername = (value) => {
  if (!isNonEmptyString(value)) return "Username is required";
  if (value.trim().length < 3) return "Username must be at least 3 characters";
  if (!/^[A-Za-z0-9_.-]+$/.test(value)) return "Only letters, numbers, dot, dash, underscore";
  return null;
};

export const validateEmail = (value) => {
  if (!isNonEmptyString(value)) return "Email is required";
  const email = String(value).trim();
  // Basic strict format: local@domain.tld with no spaces, TLD length >= 2
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return "Enter a valid email";
  return null;
};

export const validatePhone = (value) => {
  // Make phone required and enforce E.164-ish format: + and 10–15 digits
  if (!isNonEmptyString(value)) return "Phone number is required";
  const digitsOnly = String(value).replace(/\s|-/g, '');
  const e164Like = /^\+?[1-9]\d{9,14}$/; // allows optional +, total digits 10-15, no leading 0
  if (!e164Like.test(digitsOnly)) return "Enter a valid phone number (e.g., +12345678901)";
  return null;
};

export const validatePassword = (value) => {
  const p = value || "";
  if (p.length < 8) return "Min 8 characters";
  if (!/[A-Z]/.test(p)) return "Include at least one uppercase letter";
  if (!/[0-9]/.test(p)) return "Include at least one number";
  if (!/[^A-Za-z0-9]/.test(p)) return "Include at least one symbol";
  return null;
};

export const validateConfirm = (password, confirm) => {
  if (!isNonEmptyString(confirm)) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return null;
};

// Generic helper to build error maps from a config of validators
export const buildErrors = (fields) => {
  // fields: { key: { value, validators: [fn] } }
  const errors = {};
  Object.keys(fields).forEach((key) => {
    const config = fields[key];
    for (const validator of (config.validators || [])) {
      const message = validator(config.value);
      if (message) {
        errors[key] = message;
        break;
      }
    }
  });
  return errors;
};

// Role-specific minimal validations (optional fields can be added as needed)
export const roleFieldValidators = {
  customer: {
    fullName: (v) => (isNonEmptyString(v) ? null : "Full Name is required"),
    address: (v) => (isNonEmptyString(v) ? null : "Address is required"),
  },
  farmer: {
    fullName: (v) => (isNonEmptyString(v) ? null : "Full Name is required"),
    farmLocation: (v) => (isNonEmptyString(v) ? null : "Farm Location is required"),
    farmSize: (v) => (Number(v) > 0 ? null : "Enter valid farm size"),
    idProof: (v) => (v ? null : "ID Proof is required"),
  },
  agricare: {
    businessName: (v) => (isNonEmptyString(v) ? null : "Business Name is required"),
    licenseNo: (v) => (isNonEmptyString(v) ? null : "License No. is required"),
    gstNo: (v) => (isNonEmptyString(v) ? null : "GST No. is required"),
    address: (v) => (isNonEmptyString(v) ? null : "Business Address is required"),
  },
  hub: {
    managerName: (v) => (isNonEmptyString(v) ? null : "Manager Name is required"),
    hubLocation: (v) => (isNonEmptyString(v) ? null : "Hub Location is required"),
    capacity: (v) => (Number(v) > 0 ? null : "Enter valid capacity"),
  },
  admin: {
    fullName: (v) => (isNonEmptyString(v) ? null : "Full Name is required"),
    roleKey: (v) => (isNonEmptyString(v) ? null : "Select an admin role"),
  },
};

export const sanitizeObject = (obj) => {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed.length > 0) out[k] = trimmed;
    } else if (v instanceof File) {
      out[k] = v; // keep files as is for FormData use-cases
    } else if (typeof v === "number" && !Number.isNaN(v)) {
      out[k] = v;
    } else if (typeof v === "boolean") {
      out[k] = v;
    }
  });
  return out;
};


