import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

import {
  getStudent,
  markFood,
  getCurrentMeal,
} from "../services/api";

function VolunteerDashboard() {
  const [token, setToken] = useState("");
  const [student, setStudent] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================
  // CURRENT MEAL
  // =====================================

  const [currentMeal, setCurrentMeal] = useState(null);
  const [mealLoading, setMealLoading] = useState(true);

  const scannerRef = useRef(null);

  const volunteerId =
    localStorage.getItem("volunteerId") || "volunteer";

  // =====================================
  // LOAD CURRENT MEAL
  // =====================================

  const loadCurrentMeal = async () => {
    try {
      setMealLoading(true);

      const result = await getCurrentMeal();

      console.log("Current meal response:", result);

      if (result.success) {
        setCurrentMeal(result.meal);
      } else {
        setError(
          result.message || "Could not load current meal."
        );
      }
    } catch (err) {
      console.error("Current meal error:", err);
      setError("Failed to load current meal.");
    } finally {
      setMealLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentMeal();

    // Check for meal changes periodically.
    const interval = setInterval(() => {
      loadCurrentMeal();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =====================================
  // SEARCH STUDENT
  // =====================================

  const searchStudent = async (searchToken = token) => {
    const cleanToken = searchToken.trim();

    if (!cleanToken) {
      setError("Please enter a token number.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setStudent(null);

    try {
      console.log("Searching token:", cleanToken);

      const result = await getStudent(cleanToken);

      console.log("Student response:", result);

      if (result.success) {
        setStudent(result.student);
      } else {
        setError(
          result.message || "Student not found."
        );
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search student.");
    }

    setLoading(false);
  };

  // =====================================
  // STOP SCANNER
  // =====================================

  const stopScanner = async () => {
    console.log("Stopping scanner...");

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.log("Scanner stop:", err);
      }

      try {
        await scannerRef.current.clear();
      } catch (err) {
        console.log("Scanner clear:", err);
      }

      scannerRef.current = null;
    }

    setScannerOpen(false);
  };

  // =====================================
  // START SCANNER
  // =====================================

  const startScanner = () => {
    setError("");
    setMessage("");
    setStudent(null);

    console.log("Opening QR scanner...");

    setScannerOpen(true);
  };

  // =====================================
  // ACTUALLY START CAMERA AFTER DOM LOADS
  // =====================================

  useEffect(() => {
    if (!scannerOpen) {
      return;
    }

    let cancelled = false;

    const initializeScanner = async () => {
      try {
        console.log("Starting QR scanner...");

        // Wait until React creates #qr-reader
        const waitForElement = () => {
          return new Promise((resolve, reject) => {
            let attempts = 0;

            const check = () => {
              const element =
                document.getElementById("qr-reader");

              if (element) {
                resolve(element);
                return;
              }

              attempts++;

              if (attempts > 50) {
                reject(
                  new Error(
                    "QR reader element was not created."
                  )
                );
                return;
              }

              setTimeout(check, 100);
            };

            check();
          });
        };

        await waitForElement();

        if (cancelled) {
          return;
        }

        const cameras =
          await Html5Qrcode.getCameras();

        console.log(
          "Available cameras:",
          cameras
        );

        if (!cameras || cameras.length === 0) {
          throw new Error("No camera found.");
        }

        // Use first available camera
        const cameraId = cameras[0].id;

        console.log(
          "Using camera:",
          cameras[0].label
        );

        const scanner =
          new Html5Qrcode("qr-reader");

        scannerRef.current = scanner;

        await scanner.start(
          cameraId,

          {
            fps: 15,

            qrbox: {
              width: 300,
              height: 300,
            },

            aspectRatio: 1.0,

            disableFlip: false,
          },

          async (decodedText) => {
            console.log(
              "🔥🔥🔥 QR DETECTED:",
              decodedText
            );

            const scannedToken =
              decodedText.trim();

            setToken(scannedToken);

            try {
              await scanner.stop();
            } catch (err) {
              console.log(
                "Scanner stop:",
                err
              );
            }

            try {
              await scanner.clear();
            } catch (err) {
              console.log(
                "Scanner clear:",
                err
              );
            }

            scannerRef.current = null;

            setScannerOpen(false);

            await searchStudent(
              scannedToken
            );
          },

          (errorMessage) => {
            // QR not detected yet.
            // Ignore continuous scanning errors.
          }
        );

        console.log(
          "📷 QR scanner started successfully"
        );

      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "❌ QR scanner error:",
          err
        );

        setError(
          "Could not start QR scanner: " +
            (err.message || "Unknown error")
        );

        setScannerOpen(false);
      }
    };

    initializeScanner();

    return () => {
      cancelled = true;

      if (scannerRef.current) {
        const scanner =
          scannerRef.current;

        scannerRef.current = null;

        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner
              .clear()
              .catch(() => {});
          });
      }
    };
  }, [scannerOpen]);

  // =====================================
  // MARK FOOD
  // =====================================

  const handleMarkFood = async () => {
    if (!student) {
      return;
    }

    if (!currentMeal) {
      setError("Current meal is not available.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      console.log(
        "Marking food as eaten:",
        student.token,
        currentMeal.id
      );

      const result = await markFood(
        student.token,
        currentMeal.id,
        volunteerId
      );

      console.log(
        "Mark food response:",
        result
      );

      if (result.success) {
        setMessage(
          `${currentMeal.name} collected successfully.`
        );

        await searchStudent(
          student.token
        );
      } else {
        setError(
          result.message ||
            "Could not mark food."
        );
      }
    } catch (err) {
      console.error(
        "Mark food error:",
        err
      );

      setError(
        "Failed to mark food."
      );
    }

    setLoading(false);
  };

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = async () => {
    await stopScanner();

    localStorage.removeItem(
      "volunteerLoggedIn"
    );

    localStorage.removeItem(
      "volunteerId"
    );

    window.location.href =
      "/volunteer/login";
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        background: "#f5f7fa",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            Volunteer Dashboard
          </h1>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 14px",
              border: "none",
              borderRadius: "7px",
              background: "#dc3545",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        <p
          style={{
            color: "#666",
            marginBottom: "20px",
          }}
        >
          Scan a student's QR code or
          enter their token manually.
        </p>

        {/* =====================================
            CURRENT MEAL
        ===================================== */}

        <div
          style={{
            marginBottom: "25px",
            padding: "18px",
            borderRadius: "12px",
            background: "#e7f1ff",
            border: "1px solid #b6d4fe",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#084298",
              fontWeight: "bold",
              marginBottom: "5px",
              textTransform: "uppercase",
            }}
          >
            Current Meal
          </div>

          {mealLoading ? (
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              Loading meal...
            </div>
          ) : currentMeal ? (
            <>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#084298",
                }}
              >
                🍽️ {currentMeal.name}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  color: "#495057",
                }}
              >
                {currentMeal.day} •{" "}
                {currentMeal.time}
              </div>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "13px",
                  color: "#6c757d",
                }}
              >
                Meal ID: {currentMeal.id}
              </div>
            </>
          ) : (
            <div
              style={{
                color: "#842029",
                fontWeight: "bold",
              }}
            >
              Unable to load current meal.
            </div>
          )}
        </div>

        {/* SCAN BUTTON */}

        {!scannerOpen && (
          <button
            onClick={startScanner}
            style={{
              width: "100%",
              padding: "16px",
              border: "none",
              borderRadius: "10px",
              background: "#198754",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            📷 SCAN QR CODE
          </button>
        )}

        {/* SCANNER */}

        {scannerOpen && (
          <div
            style={{
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <h3>
              Point the camera at the QR code
            </h3>

            <div
              id="qr-reader"
              style={{
                width: "100%",
                maxWidth: "450px",
                minHeight: "350px",
                margin: "20px auto",
              }}
            />

            <button
              onClick={stopScanner}
              style={{
                padding: "12px 25px",
                border: "none",
                borderRadius: "8px",
                background: "#dc3545",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ✕ STOP SCANNER
            </button>
          </div>
        )}

        {/* DIVIDER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "20px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#ddd",
            }}
          />

          <span
            style={{
              color: "#888",
              fontWeight: "bold",
            }}
          >
            OR
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#ddd",
            }}
          />
        </div>

        {/* MANUAL SEARCH */}

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Token Number
          </label>

          <input
            type="text"
            placeholder="NSS_SC001"
            value={token}
            onChange={(e) =>
              setToken(
                e.target.value.toUpperCase()
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchStudent();
              }
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          />

          <button
            onClick={() => searchStudent()}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#0d6efd",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading
              ? "SEARCHING..."
              : "SEARCH TOKEN"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "8px",
              background: "#f8d7da",
              color: "#842029",
              fontWeight: "bold",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "8px",
              background: "#d1e7dd",
              color: "#0f5132",
              fontWeight: "bold",
            }}
          >
            ✅ {message}
          </div>
        )}

        {/* STUDENT DETAILS */}

        {student && (
          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              background: "#fafafa",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
              }}
            >
              Student Details
            </h2>

            <Detail
              label="Token"
              value={student.token}
            />

            <Detail
              label="Name"
              value={student.name}
            />

            <Detail
              label="College"
              value={student.college}
            />

            <Detail
              label="Phone"
              value={student.phone}
            />

            <Detail
              label="Department"
              value={student.department}
            />

            <Detail
              label="Gender"
              value={student.gender}
            />

            {/* CURRENT MEAL */}

            {currentMeal && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  borderRadius: "8px",
                  background: "#e7f1ff",
                  color: "#084298",
                }}
              >
                <strong>
                  🍽️ Current Meal:
                </strong>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginTop: "5px",
                  }}
                >
                  {currentMeal.name}
                </div>

                <div
                  style={{
                    marginTop: "3px",
                  }}
                >
                  {currentMeal.day} •{" "}
                  {currentMeal.time}
                </div>
              </div>
            )}

            {/* FOOD STATUS */}

            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "8px",
                background:
                  student.foodStatus ===
                  "EATEN"
                    ? "#f8d7da"
                    : "#d1e7dd",
                color:
                  student.foodStatus ===
                  "EATEN"
                    ? "#842029"
                    : "#0f5132",
              }}
            >
              <strong>
                Food Status:
              </strong>

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                {student.foodStatus ||
                  "NOT EATEN"}
              </div>
            </div>

            {/* ALREADY EATEN */}

            {student.foodStatus ===
            "EATEN" ? (
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  borderRadius: "8px",
                  background: "#fff3cd",
                  color: "#664d03",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                  }}
                >
                  ⚠️ Food already collected
                </h3>

                <p>
                  <strong>Time:</strong>{" "}
                  {student.foodTime ||
                    "Not available"}
                </p>

                <p>
                  <strong>
                    Verified by:
                  </strong>{" "}
                  {student.verifiedBy ||
                    "Not available"}
                </p>
              </div>
            ) : (
              <button
                onClick={handleMarkFood}
                disabled={
                  loading || !currentMeal
                }
                style={{
                  width: "100%",
                  padding: "16px",
                  marginTop: "20px",
                  border: "none",
                  borderRadius: "10px",
                  background:
                    loading || !currentMeal
                      ? "#6c757d"
                      : "#198754",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor:
                    loading || !currentMeal
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading
                  ? "PROCESSING..."
                  : `🍽️ COLLECT ${currentMeal?.name?.toUpperCase() || "FOOD"}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================
// DETAIL COMPONENT
// =====================================

function Detail({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        padding: "10px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      <strong>{label}:</strong>

      <span
        style={{
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default VolunteerDashboard;