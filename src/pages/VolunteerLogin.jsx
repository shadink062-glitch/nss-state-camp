import { useState } from "react";
import { useNavigate } from "react-router-dom";

// =====================================================
// VOLUNTEER CREDENTIALS
// =====================================================
// Add, remove, or rename entries here as needed — each
// username becomes that volunteer's ID, which is what
// shows up in the "Verified By" column in FoodRecords.
// Change the passwords below before the camp.
// =====================================================

const VOLUNTEERS = [
  { username: "volunteer1", password: "123456" },
  { username: "volunteer2", password: "123456" },
  { username: "volunteer3", password: "123456" },
  { username: "volunteer4", password: "123456" },
  { username: "volunteer5", password: "123456" },
];

function VolunteerLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const match = VOLUNTEERS.find(
      (v) =>
        v.username.toLowerCase() === cleanUsername &&
        v.password === cleanPassword
    );

    if (match) {
      localStorage.setItem("volunteerLoggedIn", "true");
      localStorage.setItem("volunteerId", match.username);

      navigate("/volunteer");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "35px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
          Volunteer Login
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          NSS State Camp
        </p>

        <form onSubmit={handleLogin}>
          <label>Username</label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p
              style={{
                color: "red",
                textAlign: "center",
                marginBottom: "15px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default VolunteerLogin;
