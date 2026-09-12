import { useState } from "react";
import { registerStudent } from "../services/api";
import { QRCodeCanvas } from "qrcode.react";

function StudentRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    phone: "",
    department: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [error, setError] = useState("");

  const colleges = [
    "Test College",
    "ABC College",
    "XYZ College",
  ];

  const departments = [
    "Computer Science",
    "BCA",
    "Commerce",
    "Physics",
  ];

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
      !formData.college ||
      !formData.phone ||
      !formData.department ||
      !formData.gender
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerStudent(formData);

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

  // SUCCESS SCREEN
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

  // REGISTRATION FORM
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


          {/* COLLEGE */}

          <div className="form-group">

            <label>
              College
            </label>

            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
            >

              <option value="">
                Select your college
              </option>

              {colleges.map((college) => (
                <option
                  key={college}
                  value={college}
                >
                  {college}
                </option>
              ))}

            </select>

          </div>


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


          {/* DEPARTMENT */}

          <div className="form-group">

            <label>
              Department
            </label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
            >

              <option value="">
                Select your department
              </option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}

            </select>

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


          {/* SUBMIT */}

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