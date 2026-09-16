import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { registerStudent } from "../services/api";

export default function StudentRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    college: "",
    nssUnitNumber: "",
    district: "",
    phone: "",
    email: "",
    department: "",
    gender: "",
    poName: "",
    poNumber: "",
    foodPreference: "",
  });

  const [loading, setLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // CALCULATE AGE
  // =========================

  const calculateAge = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const age = calculateAge(formData.dob);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.name ||
      !formData.dob ||
      !formData.college ||
      !formData.nssUnitNumber ||
      !formData.district ||
      !formData.phone ||
      !formData.email ||
      !formData.department ||
      !formData.gender ||
      !formData.poName ||
      !formData.poNumber ||
      !formData.foodPreference
    ) {
      setError("Please complete all required fields before registering.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (age < 1 || age > 100) {
      setError("Please enter a valid date of birth.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);

     const result = await registerStudent({
  ...formData,
  age,
});

      if (result.success) {
        setRegistrationResult(result);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(result.message || "Registration failed.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SUCCESS SCREEN
  // =========================

  if (registrationResult) {
    return (
      <div style={styles.page}>
        <style>{globalStyles}</style>

        <div style={styles.successWrapper}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>

            <div style={styles.successBadge}>REGISTRATION COMPLETE</div>

            <h1 style={styles.successTitle}>You're officially registered!</h1>

            <p style={styles.successSubtitle}>
              Welcome to the NSS State Camp 2026. Your registration has been
              successfully recorded.
            </p>

            <div style={styles.tokenBox}>
              <span style={styles.tokenLabel}>YOUR CAMP TOKEN</span>
              <div style={styles.token}>{registrationResult.token}</div>
              <span style={styles.tokenHint}>Keep this token safe</span>
            </div>

            <div style={styles.qrBox}>
              <div style={styles.qrContainer}>
                <QRCodeCanvas
                  value={registrationResult.token}
                  size={220}
                  level="H"
                />
              </div>

              <h3 style={styles.qrTitle}>Your QR Code</h3>

              <p style={styles.qrText}>
                Show this QR code to the NSS volunteer when collecting your
                food.
              </p>
            </div>

            <div style={styles.warningBox}>
              <span style={styles.warningIcon}>!</span>
              <div>
                <strong>Important</strong>
                <p>
                  Take a screenshot of this page or save your token number for
                  the camp.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              style={styles.newRegistrationButton}
            >
              Register Another Student
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // REGISTRATION FORM
  // =========================

  return (
    <div style={styles.page}>
      <style>{globalStyles}</style>

      {/* TOP BRANDING */}
      <header style={styles.topBar}>
        <div style={styles.brandContainer}>
          <div style={styles.logo}>NSS</div>
          <div>
            <div style={styles.brandTitle}>NSS STATE CAMP</div>
            <div style={styles.brandSubtitle}>
              2026 • Student Registration
            </div>
          </div>
        </div>

        <div style={styles.secureBadge}>
          <span style={styles.secureDot}></span>
          Registration Portal
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <div style={styles.headingArea}>
          <div style={styles.eyebrow}>
            <span style={styles.eyebrowLine}></span>
            NSS STATE CAMP 2026
            <span style={styles.eyebrowLine}></span>
          </div>

          <h1 style={styles.pageTitle}>Student Registration</h1>

          <p style={styles.pageDescription}>
            Fill in your details carefully to complete your registration for the
            NSS State Camp.
          </p>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div style={styles.errorBox}>
            <div style={styles.errorIcon}>!</div>
            <div>
              <strong>Registration incomplete</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          style={styles.formCard}
          className="registration-form-card"
        >
          {/* PERSONAL DETAILS */}
          <SectionHeader
            number="01"
            title="Personal Details"
            description="Basic information about the participant"
          />

          <div style={styles.grid} className="registration-mobile-grid">
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <InputField
              label="Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />

            <div style={styles.field}>
              <label style={styles.label}>
                Age <span style={styles.required}>*</span>
              </label>

              <div style={styles.ageWrapper}>
                <input
                  type="number"
                  value={age}
                  placeholder="Auto calculated"
                  readOnly
                  style={{
                    ...styles.input,
                    ...styles.readOnlyInput,
                  }}
                />
                {age !== "" && (
                  <span style={styles.calculatedBadge}>AUTO</span>
                )}
              </div>
            </div>

            <SelectField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="Select gender"
              options={["Male", "Female", "Other"]}
              required
            />

            <SelectField
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="Select your district"
              options={[
                "Thiruvananthapuram",
                "Kollam",
                "Pathanamthitta",
                "Alappuzha",
                "Kottayam",
                "Idukki",
                "Ernakulam",
                "Thrissur",
                "Palakkad",
                "Malappuram",
                "Kozhikode",
                "Wayanad",
                "Kannur",
                "Kasaragod",
              ]}
              required
            />
          </div>

          {/* COLLEGE DETAILS */}
          <SectionHeader
            number="02"
            title="College & NSS Details"
            description="Information about your college and NSS unit"
          />

          <div style={styles.grid} className="registration-mobile-grid">
            <InputField
              label="College Name"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="Enter your college name"
              fullWidth
              required
            />

            <InputField
              label="NSS Unit Number"
              name="nssUnitNumber"
              value={formData.nssUnitNumber}
              onChange={handleChange}
              placeholder="e.g. Unit 123"
              required
            />

            <InputField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter your department"
              required
            />
          </div>

          <div style={styles.subSection}>
            <div style={styles.subSectionTitle}>Programme Officer Details</div>

            <div style={styles.grid} className="registration-mobile-grid">
              <InputField
                label="NSS PO Name"
                name="poName"
                value={formData.poName}
                onChange={handleChange}
                placeholder="Enter NSS PO name"
                required
              />

              <InputField
                label="NSS PO Number"
                name="poNumber"
                type="tel"
                value={formData.poNumber}
                onChange={handleChange}
                placeholder="Enter PO phone number"
                required
              />
            </div>
          </div>

          {/* CONTACT DETAILS */}
          <SectionHeader
            number="03"
            title="Contact Details"
            description="How we can contact you if required"
          />

          <div style={styles.grid} className="registration-mobile-grid">
            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          {/* FOOD PREFERENCE */}
          <SectionHeader
            number="04"
            title="Food Preference"
            description="Select your preferred meal category"
          />

          <div style={styles.foodOptions} className="registration-mobile-grid">
            <FoodOption
              value="Vegetarian"
              selected={formData.foodPreference === "Vegetarian"}
              onClick={() =>
                setFormData({
                  ...formData,
                  foodPreference: "Vegetarian",
                })
              }
              icon="🥗"
              title="Vegetarian"
              description="Vegetarian meals"
            />

            <FoodOption
              value="Non-Vegetarian"
              selected={formData.foodPreference === "Non-Vegetarian"}
              onClick={() =>
                setFormData({
                  ...formData,
                  foodPreference: "Non-Vegetarian",
                })
              }
              icon="🍗"
              title="Non-Vegetarian"
              description="Non-vegetarian meals"
            />
          </div>

          {/* SUBMIT AREA */}
          <div style={styles.submitArea}>
            <div style={styles.submitNote}>
              <span style={styles.noteIcon}>✓</span>
              <span>
                By registering, you confirm that the information provided is
                accurate.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {}),
              }}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Registering...
                </>
              ) : (
                <>
                  Complete Registration
                  <span style={styles.arrow}>→</span>
                </>
              )}
            </button>
          </div>
        </form>

        <footer style={styles.footer}>
          <div>NSS State Camp 2026</div>
          <div>Registration Portal</div>
        </footer>
      </main>
    </div>
  );
}

// =====================================================
// HELPER COMPONENTS
// =====================================================

function SectionHeader({ number, title, description }) {
  return (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionNumber}>{number}</div>
      <div>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionDescription}>{description}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  fullWidth = false,
}) {
  return (
    <div
      style={{
        ...styles.field,
        ...(fullWidth ? styles.fullWidth : {}),
      }}
    >
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={styles.input}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  placeholder,
  options,
  required = false,
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          ...styles.input,
          ...styles.select,
          color: value ? "#172033" : "#9aa3b2",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FoodOption({ selected, onClick, icon, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.foodOption,
        ...(selected ? styles.foodOptionSelected : {}),
      }}
    >
      <div
        style={{
          ...styles.foodIcon,
          ...(selected ? styles.foodIconSelected : {}),
        }}
      >
        {icon}
      </div>

      <div style={styles.foodText}>
        <div style={styles.foodTitle}>{title}</div>
        <div style={styles.foodDescription}>{description}</div>
      </div>

      <div
        style={{
          ...styles.radio,
          ...(selected ? styles.radioSelected : {}),
        }}
      >
        {selected && <div style={styles.radioDot}></div>}
      </div>
    </button>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb 0%, #eef2f8 100%)",
    color: "#172033",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  topBar: {
    height: "76px",
    background: "#ffffff",
    borderBottom: "1px solid #e8ebf1",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 6%",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #111827, #334155)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  brandTitle: {
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "1px",
  },
  brandSubtitle: {
    fontSize: "11px",
    color: "#00845c",
    marginTop: "2px",
  },
  secureBadge: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#657084",
  },
  secureDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 0 4px rgba(34,197,94,0.10)",
  },
  main: {
    width: "min(940px, 92%)",
    margin: "0 auto",
    padding: "54px 0 30px",
  },
  headingArea: {
    textAlign: "center",
    marginBottom: "32px",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "#7b8495",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "13px",
  },
  eyebrowLine: {
    width: "25px",
    height: "1px",
    background: "#0951d7",
  },
  pageTitle: {
    fontSize: "38px",
    lineHeight: "1.15",
    letterSpacing: "-1.2px",
    margin: 0,
    fontWeight: "800",
     color: "#260fbf",
  },
  pageDescription: {
    maxWidth: "560px",
    margin: "13px auto 0",
    color: "#260fbf",
    fontSize: "14px",
    lineHeight: "1.7",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    background: "#fff5f5",
    border: "1px solid #ffd6d6",
    borderRadius: "14px",
    padding: "14px 16px",
    marginBottom: "20px",
    color: "#b42318",
  },
  errorIcon: {
    width: "25px",
    height: "25px",
    minWidth: "25px",
    borderRadius: "50%",
    background: "#fee2e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "13px",
  },
  formCard: {
    background: "#ffffff",
    border: "1px solid #e6e9ef",
    borderRadius: "22px",
    boxShadow: "0 15px 45px rgba(15,23,42,0.06)",
    padding: "36px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    paddingBottom: "20px",
    marginBottom: "24px",
    borderBottom: "1px solid #edf0f4",
  },
  sectionNumber: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background: "#f1f3f7",
    color: "#175fd3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "750",
    letterSpacing: "-0.2px",
  },
  sectionDescription: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#090909",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "34px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: 0,
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#3e4859",
  },
  required: {
    color: "#ef4444",
    marginLeft: "3px",
  },
  input: {
    width: "100%",
    height: "48px",
    boxSizing: "border-box",
    border: "1px solid #dfe3ea",
    borderRadius: "11px",
    background: "#fbfcfe",
    padding: "0 14px",
    fontSize: "13px",
    color: "#172033",
    outline: "none",
    transition:
      "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  },
  select: {
    cursor: "pointer",
  },
  readOnlyInput: {
    background: "#f3f5f8",
    color: "#687386",
    cursor: "default",
  },
  ageWrapper: {
    position: "relative",
  },
  calculatedBadge: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.8px",
    color: "#6b7280",
    background: "#e7eaf0",
    borderRadius: "5px",
    padding: "4px 6px",
  },
  subSection: {
    background: "#fafbfc",
    border: "1px solid #edf0f4",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "34px",
  },
  subSectionTitle: {
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#697386",
    marginBottom: "18px",
  },
  foodOptions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "35px",
  },
  foodOption: {
    border: "1px solid #e2e6ed",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#172033",
  },
  foodOptionSelected: {
    border: "1px solid #172033",
    background: "#f7f8fa",
    boxShadow: "0 4px 15px rgba(15,23,42,0.06)",
  },
  foodIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: "#f2f4f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },
  foodIconSelected: {
    background: "#ffffff",
  },
  foodText: {
    flex: 1,
  },
  foodTitle: {
    fontSize: "13px",
    fontWeight: "750",
  },
  foodDescription: {
    fontSize: "11px",
    color: "#8a94a6",
    marginTop: "3px",
  },
  radio: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "1.5px solid #c8ced8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#172033",
  },
  radioDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#172033",
  },
  submitArea: {
    borderTop: "1px solid #edf0f4",
    paddingTop: "25px",
  },
  submitNote: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    color: "#7b8495",
    marginBottom: "17px",
  },
  noteIcon: {
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    background: "#e9f8ef",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "800",
  },
  submitButton: {
    width: "100%",
    height: "54px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #111827, #263244)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "750",
    letterSpacing: "0.2px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 8px 20px rgba(17,24,39,0.16)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  arrow: {
    fontSize: "18px",
    lineHeight: 1,
  },
  spinner: {
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    color: "#9aa3b2",
    fontSize: "10px",
    fontWeight: "600",
    padding: "22px 5px",
  },
  successWrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    boxSizing: "border-box",
  },
  successCard: {
    width: "min(500px, 100%)",
    background: "#ffffff",
    border: "1px solid #e5e8ee",
    borderRadius: "24px",
    boxShadow: "0 25px 70px rgba(15,23,42,0.10)",
    padding: "42px",
    textAlign: "center",
  },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "#ecfdf3",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "800",
    margin: "0 auto 17px",
    boxShadow: "0 0 0 8px #f5fdf8",
  },
  successBadge: {
    display: "inline-block",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.3px",
    color: "#15803d",
    background: "#ecfdf3",
    borderRadius: "20px",
    padding: "7px 10px",
    marginBottom: "13px",
  },
  successTitle: {
    fontSize: "27px",
    letterSpacing: "-0.7px",
    margin: "0",
    fontWeight: "800",
  },
  successSubtitle: {
    color: "#7b8495",
    fontSize: "13px",
    lineHeight: "1.7",
    margin: "11px auto 25px",
    maxWidth: "390px",
  },
  tokenBox: {
    background: "#f7f8fa",
    border: "1px solid #e7eaf0",
    borderRadius: "15px",
    padding: "17px",
    marginBottom: "22px",
  },
  tokenLabel: {
    display: "block",
    color: "#8a94a6",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.4px",
    marginBottom: "7px",
  },
  token: {
    fontSize: "29px",
    fontWeight: "850",
    letterSpacing: "1px",
    color: "#111827",
  },
  tokenHint: {
    display: "block",
    color: "#9aa3b2",
    fontSize: "10px",
    marginTop: "4px",
  },
  qrBox: {
    border: "1px solid #e7eaf0",
    borderRadius: "17px",
    padding: "20px",
    marginBottom: "18px",
  },
  qrContainer: {
    display: "inline-flex",
    padding: "13px",
    background: "#ffffff",
    border: "1px solid #edf0f4",
    borderRadius: "12px",
  },
  qrTitle: {
    fontSize: "14px",
    margin: "13px 0 4px",
    fontWeight: "750",
  },
  qrText: {
    margin: 0,
    color: "#8a94a6",
    fontSize: "11px",
    lineHeight: "1.6",
  },
  warningBox: {
    display: "flex",
    alignItems: "flex-start",
    textAlign: "left",
    gap: "10px",
    background: "#fffbeb",
    border: "1px solid #f5e6b4",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "18px",
  },
  warningIcon: {
    width: "21px",
    height: "21px",
    minWidth: "21px",
    borderRadius: "50%",
    background: "#fef3c7",
    color: "#b45309",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "11px",
  },
  newRegistrationButton: {
    width: "100%",
    height: "45px",
    border: "1px solid #dfe3ea",
    background: "#ffffff",
    borderRadius: "10px",
    color: "#4b5565",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
  },
};

// =====================================================
// GLOBAL STYLES (INJECTED)
// =====================================================

const globalStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #f5f7fb;
  }

  input:focus,
  select:focus {
    border-color: #64748b !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 3px rgba(100,116,139,0.10);
  }

  input::placeholder {
    color: #a3abba;
  }

  select {
    appearance: auto;
  }

  button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 700px) {
    .registration-mobile-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 560px) {
    .registration-form-card {
      padding: 22px !important;
    }
  }
`;