import { useState } from "react";
import { registerStudent } from "../services/api";
import { QRCodeCanvas } from "qrcode.react";

function StudentRegistration() {
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

  // Calculate age automatically from DOB
  const calculateAge = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const age = calculateAge(formData.dob);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
      setError("Please fill in all fields.");
      return;
    }

    if (age < 1 || age > 100) {
      setError("Please enter a valid date of birth.");
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
      } else {
        setError(result.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SUCCESS SCREEN
  // =========================

  if (registrationResult) {
    return (
      <div className="registration-success">
        <div className="success-card">

          <div className="success-icon">
            ✓
          </div>

          <h1>Registration Successful!</h1>

          <p>
            You have successfully registered for
            the NSS State Camp.
          </p>

          <div className="token-section">

            <p>Your Token Number</p>

            <h2>
              {registrationResult.token}
            </h2>

          </div>

          <div className="qr-section">

            <QRCodeCanvas
              value={registrationResult.token}
              size={220}
            />

            <p>
              Show this QR code when collecting
              food at the camp.
            </p>

          </div>

          <div className="save-message">
            ⚠️ Please save your token number.
          </div>

        </div>
      </div>
    );
  }

  // =========================
  // REGISTRATION FORM
  // =========================

  return (
    <div className="registration-page">

      <div className="registration-card">

        <div className="registration-header">

          <h1>NSS State Camp</h1>

          <p>
            Student Registration
          </p>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ===================== */}
          {/* PERSONAL DETAILS */}
          {/* ===================== */}

          <h3 className="form-section-title">
            Personal Details
          </h3>

          {/* NAME */}

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />

          </div>


          {/* DATE OF BIRTH */}

          <div className="form-group">

            <label>
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />

          </div>


          {/* AGE */}

          <div className="form-group">

            <label>
              Age
            </label>

            <input
              type="number"
              value={age}
              placeholder="Age will be calculated automatically"
              readOnly
            />

          </div>


          {/* GENDER */}

          <div className="form-group">

            <label>
              Gender
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >

              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* DISTRICT */}

          <div className="form-group">

            <label>
              District
            </label>

            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
            >

              <option value="">
                Select your district
              </option>

              <option value="Thiruvananthapuram">
                Thiruvananthapuram
              </option>

              <option value="Kollam">
                Kollam
              </option>

              <option value="Pathanamthitta">
                Pathanamthitta
              </option>

              <option value="Alappuzha">
                Alappuzha
              </option>

              <option value="Kottayam">
                Kottayam
              </option>

              <option value="Idukki">
                Idukki
              </option>

              <option value="Ernakulam">
                Ernakulam
              </option>

              <option value="Thrissur">
                Thrissur
              </option>

              <option value="Palakkad">
                Palakkad
              </option>

              <option value="Malappuram">
                Malappuram
              </option>

              <option value="Kozhikode">
                Kozhikode
              </option>

              <option value="Wayanad">
                Wayanad
              </option>

              <option value="Kannur">
                Kannur
              </option>

              <option value="Kasaragod">
                Kasaragod
              </option>

            </select>

          </div>


          {/* ===================== */}
          {/* COLLEGE & NSS DETAILS */}
          {/* ===================== */}

          <h3 className="form-section-title">
            College & NSS Details
          </h3>


          {/* COLLEGE */}

          <div className="form-group">

            <label>
              College Name
            </label>

            <input
              type="text"
              name="college"
              placeholder="Enter your college name"
              value={formData.college}
              onChange={handleChange}
            />

          </div>


          {/* NSS UNIT */}

          <div className="form-group">

            <label>
              NSS Unit Number
            </label>

            <input
              type="text"
              name="nssUnitNumber"
              placeholder="Enter NSS unit number"
              value={formData.nssUnitNumber}
              onChange={handleChange}
            />

          </div>


          {/* DEPARTMENT */}

          <div className="form-group">

            <label>
              Department
            </label>

            <input
              type="text"
              name="department"
              placeholder="Enter your department"
              value={formData.department}
              onChange={handleChange}
            />

          </div>


          {/* PO NAME */}

          <div className="form-group">

            <label>
              NSS PO Name
            </label>

            <input
              type="text"
              name="poName"
              placeholder="Enter NSS PO name"
              value={formData.poName}
              onChange={handleChange}
            />

          </div>


          {/* PO NUMBER */}

          <div className="form-group">

            <label>
              NSS PO Number
            </label>

            <input
              type="tel"
              name="poNumber"
              placeholder="Enter NSS PO phone number"
              value={formData.poNumber}
              onChange={handleChange}
            />

          </div>


          {/* ===================== */}
          {/* CONTACT DETAILS */}
          {/* ===================== */}

          <h3 className="form-section-title">
            Contact Details
          </h3>


          {/* PHONE */}

          <div className="form-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />

          </div>


          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email ID
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
            />

          </div>


          {/* ===================== */}
          {/* FOOD PREFERENCE */}
          {/* ===================== */}

          <h3 className="form-section-title">
            Food Preference
          </h3>


          <div className="form-group">

            <label>
              Food Preference
            </label>

            <select
              name="foodPreference"
              value={formData.foodPreference}
              onChange={handleChange}
            >

              <option value="">
                Select food preference
              </option>

              <option value="Vegetarian">
                Vegetarian
              </option>

              <option value="Non-Vegetarian">
                Non-Vegetarian
              </option>

            </select>

          </div>


          {/* ===================== */}
          {/* SUBMIT */}
          {/* ===================== */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Registering..."
              : "REGISTER NOW"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default StudentRegistration;