import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    // Admin credentials
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "admin123";

    if (
      username === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {
      localStorage.setItem("adminLoggedIn", "true");

      navigate("/admin");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "35px",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          NSS State Camp 2026
        </p>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter admin username"
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                borderRadius: "8px",
                background: "#f8d7da",
                color: "#842029",
                fontWeight: "bold",
              }}
            >
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#0d6efd",
              color: "white",
              fontSize: "17px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;