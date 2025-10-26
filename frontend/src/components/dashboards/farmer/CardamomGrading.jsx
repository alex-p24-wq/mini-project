import React, { useState } from "react";
import "../../../css/FarmerDashboard.css";

// Cardamom grading: supports manual inputs and image-based grading.
// Image grading will try an optional backend endpoint (VITE_GRADE_API),
// and if unavailable, fall back to a simple on-device heuristic.
export default function CardamomGrading() {
  // Manual form grading state
  const [form, setForm] = useState({ sizeMm: "", color: "Green", moisturePct: "" });
  const [manualGrade, setManualGrade] = useState(null);

  // Image-based grading state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageGrade, setImageGrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ----- Manual grading -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const computeManualGrade = (e) => {
    e.preventDefault();
    const size = Number(form.sizeMm);
    const moisture = Number(form.moisturePct);

    // Simple heuristic: prioritize larger size, lower moisture, greener color
    let g = "Regular";
    if (size >= 7 && moisture <= 12 && form.color === "Green") g = "Premium";
    else if (size >= 6 && moisture <= 14) g = "Special";
    setManualGrade(g);
  };

  // ----- Image-based grading -----
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageGrade(null);
    setError(null);
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Try backend first if provided
  const analyzeWithBackendIfAvailable = async (file) => {
    const endpoint = import.meta?.env?.VITE_GRADE_API; // e.g., http://localhost:5000/api/farmer/grade-image
    if (!endpoint) return null;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(endpoint, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    // Expecting { grade: 'Premium' | 'Special' | 'Regular' }
    return data?.grade || null;
  };

  // Fallback: on-device quick heuristic using average color
  const analyzeImageHeuristic = async (fileOrUrl) => {
    const img = new Image();
    const src = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    img.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });

    const maxSide = 256; // downscale for speed
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.max(1, Math.floor(img.width * scale));
    const h = Math.max(1, Math.floor(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    const { data } = ctx.getImageData(0, 0, w, h);

    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;

    // Sample every Nth pixel to speed things up
    const stride = 4 * 4; // every 4th pixel (RGBA)
    for (let i = 0; i < data.length; i += stride) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalR += r; totalG += g; totalB += b; count++;
    }

    const avgR = totalR / count;
    const avgG = totalG / count;
    const avgB = totalB / count;
    const brightness = (avgR + avgG + avgB) / 3;

    // Heuristic:
    // - Premium: strong green dominance and moderate brightness
    // - Special: green is the max channel
    // - Regular: otherwise
    let g = "Regular";
    const greenDominance = avgG - Math.max(avgR, avgB);
    if (greenDominance > 20 && avgG > 110 && brightness > 70 && brightness < 200) {
      g = "Premium";
    } else if (avgG >= avgR && avgG >= avgB) {
      g = "Special";
    }

    return g;
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setImageGrade(null);

    try {
      // Try backend
      let g = await analyzeWithBackendIfAvailable(imageFile);
      if (!g) {
        // Fallback to heuristic
        g = await analyzeImageHeuristic(imagePreview || imageFile);
      }
      setImageGrade(g);
    } catch (err) {
      // Final fallback: heuristic if backend failed unexpectedly
      try {
        const g = await analyzeImageHeuristic(imagePreview || imageFile);
        setImageGrade(g);
      } catch (e2) {
        setError("Failed to analyze image. Please try another photo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header"><h3>Cardamom Grading</h3></div>
      <div className="card-content">
        {/* Manual grading */}
        <form onSubmit={computeManualGrade} className="form grid-3">
          <div className="form-field">
            <label>Pod Size (mm)</label>
            <input type="number" name="sizeMm" value={form.sizeMm} onChange={handleChange} min="0" step="0.1" required />
          </div>
          <div className="form-field">
            <label>Pod Color</label>
            <select name="color" value={form.color} onChange={handleChange}>
              <option>Green</option>
              <option>Yellowish</option>
              <option>Brown</option>
            </select>
          </div>
          <div className="form-field">
            <label>Moisture (%)</label>
            <input type="number" name="moisturePct" value={form.moisturePct} onChange={handleChange} min="0" step="0.1" required />
          </div>
          <div className="form-actions">
            <button className="view-all-btn" type="submit">Compute Grade</button>
          </div>
        </form>

        {manualGrade && (
          <div className="result" style={{ marginTop: 12 }}>
            <strong>Estimated Grade (Manual):</strong> {manualGrade}
          </div>
        )}

        {/* Divider */}
        <hr style={{ margin: "20px 0" }} />

        {/* Image-based grading */}
        <div className="form grid-3">
          <div className="form-field" style={{ gridColumn: "span 2" }}>
            <label>Upload Cardamom Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div style={{ marginTop: 8 }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: 240, borderRadius: 8, border: "1px solid #ddd" }} />
              </div>
            )}
          </div>
          <div className="form-actions" style={{ alignSelf: "end" }}>
            <button className="view-all-btn" type="button" onClick={handleAnalyzeImage} disabled={!imageFile || loading}>
              {loading ? "Analyzing..." : "Grade from Image"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: "#b00020", marginTop: 12 }}>{error}</div>
        )}

        {imageGrade && (
          <div className="result" style={{ marginTop: 12 }}>
            <strong>Estimated Grade (Image):</strong> {imageGrade}
          </div>
        )}

        {!import.meta?.env?.VITE_GRADE_API && (
          <p style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
            Tip: Configure VITE_GRADE_API to use a server-side model. Falling back to on-device heuristic.
          </p>
        )}
      </div>
    </div>
  );
}