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

  const [currentMeal, setCurrentMeal] = useState(null);
  const [mealLoading, setMealLoading] = useState(true);

  const scannerRef = useRef(null);

  const volunteerId =
    localStorage.getItem("volunteerId") || "volunteer";

  // =====================================
  // LOAD CURRENT MEAL
  // =====================================

  const loadCurrentMeal = async (showLoading = false) => {
    try {
      if (showLoading) {
        setMealLoading(true);
      }

      const result = await getCurrentMeal();

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
      if (showLoading) {
        setMealLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCurrentMeal(true);

    const interval = setInterval(() => {
      loadCurrentMeal(false);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =====================================
  // SEARCH STUDENT
  // =====================================

  const searchStudent = async (searchToken = token) => {
    const cleanToken = searchToken.trim().toUpperCase();

    if (!cleanToken) {
      setError("Please enter a token number.");
      return;
    }

    if (!currentMeal) {
      setError("Current meal is not available.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setStudent(null);

    try {
      const result = await getStudent(
        cleanToken,
        currentMeal.id
      );

      if (result.success) {
        setStudent(result.student);
      } else {
        setError(
          result.message || "Student not found."
        );
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err?.message || "Failed to search student."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // STOP SCANNER
  // =====================================

  const stopScanner = async () => {
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
    setScannerOpen(true);
  };

  // =====================================
  // QR SCANNER EFFECT
  // =====================================

  useEffect(() => {
    if (!scannerOpen) {
      return;
    }

    let cancelled = false;

    const initializeScanner = async () => {
      try {
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

        if (cancelled) return;

        const cameras =
          await Html5Qrcode.getCameras();

        if (!cameras || cameras.length === 0) {
          throw new Error("No camera found.");
        }

        const cameraId = cameras[0].id;

        const scanner =
          new Html5Qrcode("qr-reader");

        scannerRef.current = scanner;

        await scanner.start(
          cameraId,
          {
            fps: 15,
            qrbox: {
              width: 280,
              height: 280,
            },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          async (decodedText) => {
            const scannedToken = decodedText.trim();
            setToken(scannedToken);

            try {
              await scanner.stop();
            } catch (err) {
              console.log("Scanner stop:", err);
            }

            try {
              await scanner.clear();
            } catch (err) {
              console.log("Scanner clear:", err);
            }

            scannerRef.current = null;
            setScannerOpen(false);

            await searchStudent(scannedToken);
          },
          () => {
            // Ignore continuous scan errors
          }
        );
      } catch (err) {
        if (cancelled) return;

        console.error("QR scanner error:", err);
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
        const scanner = scannerRef.current;
        scannerRef.current = null;

        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            scanner.clear().catch(() => {});
          });
      }
    };
  }, [scannerOpen]);

  // =====================================
  // MARK FOOD
  // =====================================

  const handleMarkFood = async () => {
    if (!student || !currentMeal) {
      setError("Current meal is not available.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await markFood(
        student.token,
        currentMeal.id,
        volunteerId
      );

      if (result.success) {
        setMessage(
          `${currentMeal.name} collected successfully.`
        );

        setStudent((prevStudent) => {
          if (!prevStudent) return prevStudent;

          return {
            ...prevStudent,
            foodStatus: "EATEN",
            foodTime: result.collectionTime || "",
            verifiedBy: result.verifiedBy || volunteerId,
          };
        });
      } else {
        setError(
          result.message || "Could not mark food."
        );
      }
    } catch (err) {
      console.error("Mark food error:", err);
      setError(
        err?.message || "Failed to mark food."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = async () => {
    await stopScanner();
    localStorage.removeItem("volunteerLoggedIn");
    localStorage.removeItem("volunteerId");
    window.location.href = "/volunteer/login";
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f4f7fb 0%, #eef2f7 100%)",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        paddingBottom: "40px",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e6eaf0",
          position: "sticky",
          top: 0,
          zIndex: 20,
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #0d6efd, #084298)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                boxShadow:
                  "0 5px 14px rgba(13, 110, 253, 0.22)",
              }}
            >
              🎫
            </div>

            <div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  color: "#172033",
                  lineHeight: 1.2,
                }}
              >
                NSS State Camp
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#7a8495",
                  marginTop: "3px",
                }}
              >
                Volunteer Food Verification
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              border: "1px solid #e1e5eb",
              background: "#ffffff",
              color: "#dc3545",
              padding: "9px 14px",
              borderRadius: "9px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "24px 20px",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "27px",
              color: "#172033",
              fontWeight: "800",
              letterSpacing: "-0.5px",
            }}
          >
            Volunteer Dashboard
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "#697586",
              fontSize: "14px",
            }}
          >
            Scan or enter a participant token to verify food collection.
          </p>
        </div>

        {/* ACTIVE MEAL BANNER */}
        <section
          style={{
            background:
              "linear-gradient(135deg, #0d6efd 0%, #084298 100%)",
            borderRadius: "18px",
            padding: "22px",
            color: "#ffffff",
            marginBottom: "20px",
            boxShadow:
              "0 10px 25px rgba(13, 110, 253, 0.18)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              right: "-45px",
              top: "-55px",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                Active Meal
              </span>

              <span
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border:
                    "1px solid rgba(255,255,255,0.22)",
                  borderRadius: "999px",
                  padding: "5px 10px",
                  fontSize: "11px",
                  fontWeight: "800",
                }}
              >
                ● LIVE
              </span>
            </div>

            {mealLoading ? (
              <div style={{ fontSize: "20px", fontWeight: "700" }}>
                Loading current meal...
              </div>
            ) : currentMeal ? (
              <>
                <div
                  style={{
                    fontSize: "27px",
                    fontWeight: "800",
                    letterSpacing: "-0.5px",
                  }}
                >
                  🍽️ {currentMeal.name}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "10px",
                    fontSize: "14px",
                    opacity: 0.9,
                  }}
                >
                  <span>{currentMeal.day}</span>
                  <span>•</span>
                  <span>{currentMeal.time}</span>
                  <span>•</span>
                  <span>{currentMeal.id}</span>
                </div>
              </>
            ) : (
              <div style={{ fontWeight: "700" }}>
                Unable to load current meal.
              </div>
            )}
          </div>
        </section>

        {/* ALERTS */}
        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "14px",
              fontWeight: "650",
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "14px",
              fontWeight: "650",
            }}
          >
            <span>✓</span>
            <span>{message}</span>
          </div>
        )}

        {/* SCAN & SEARCH CARD */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e5e9ef",
            borderRadius: "18px",
            padding: "22px",
            boxShadow:
              "0 5px 18px rgba(15, 23, 42, 0.05)",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "18px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                color: "#172033",
              }}
            >
              Verify Participant
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#7a8495",
                fontSize: "13px",
              }}
            >
              Scan the participant QR or enter their token manually.
            </p>
          </div>

          {!scannerOpen && (
            <button
              onClick={startScanner}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "13px",
                background:
                  "linear-gradient(135deg, #198754, #157347)",
                color: "#ffffff",
                padding: "17px 20px",
                fontSize: "17px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow:
                  "0 7px 16px rgba(25, 135, 84, 0.18)",
                marginBottom: "20px",
              }}
            >
              <span style={{ fontSize: "21px", marginRight: "8px" }}>
                📷
              </span>
              Scan QR Code
            </button>
          )}

          {scannerOpen && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "750",
                    color: "#172033",
                  }}
                >
                  Scan participant QR
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#7a8495",
                    marginTop: "4px",
                  }}
                >
                  Position the QR code inside the scanning area.
                </div>
              </div>

              <div
                style={{
                  background: "#101828",
                  borderRadius: "16px",
                  padding: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  id="qr-reader"
                  style={{
                    width: "100%",
                    maxWidth: "430px",
                    minHeight: "300px",
                    margin: "0 auto",
                    overflow: "hidden",
                    borderRadius: "12px",
                  }}
                />
              </div>

              <button
                onClick={stopScanner}
                style={{
                  width: "100%",
                  marginTop: "12px",
                  padding: "13px",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  background: "#fff1f2",
                  color: "#dc2626",
                  fontSize: "14px",
                  fontWeight: "750",
                  cursor: "pointer",
                }}
              >
                ✕ Stop Scanner
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "8px 0 18px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#e6eaf0",
              }}
            />
            <span
              style={{
                color: "#98a2b3",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "1px",
              }}
            >
              OR
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "#e6eaf0",
              }}
            />
          </div>

          <label
            style={{
              display: "block",
              color: "#344054",
              fontSize: "13px",
              fontWeight: "750",
              marginBottom: "7px",
            }}
          >
            Enter Token Number
          </label>

          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="NSS_SC001"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchStudent();
              }}
              style={{
                flex: "1 1 220px",
                minWidth: 0,
                boxSizing: "border-box",
                padding: "14px 15px",
                border: "1px solid #d0d5dd",
                borderRadius: "10px",
                fontSize: "15px",
                color: "#172033",
                outline: "none",
                background: "#ffffff",
              }}
            />

            <button
              onClick={() => searchStudent()}
              disabled={loading}
              style={{
                flex: "0 0 150px",
                border: "none",
                borderRadius: "10px",
                background: loading ? "#98a2b3" : "#0d6efd",
                color: "#ffffff",
                padding: "14px 18px",
                fontSize: "14px",
                fontWeight: "800",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Searching..." : "Search Token"}
            </button>
          </div>
        </section>

        {/* STUDENT DETAILS */}
        {student && (
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e5e9ef",
              borderRadius: "18px",
              padding: "22px",
              boxShadow:
                "0 5px 18px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#7a8495",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "5px",
                  }}
                >
                  Participant
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: "#172033",
                    fontSize: "22px",
                    fontWeight: "800",
                  }}
                >
                  {student.name}
                </h2>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#0d6efd",
                    fontSize: "14px",
                    fontWeight: "750",
                  }}
                >
                  {student.token}
                </div>
              </div>

              <span
                style={{
                  whiteSpace: "nowrap",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background:
                    student.foodStatus === "EATEN"
                      ? "#fee2e2"
                      : "#dcfce7",
                  color:
                    student.foodStatus === "EATEN"
                      ? "#b91c1c"
                      : "#15803d",
                  fontSize: "11px",
                  fontWeight: "800",
                }}
              >
                {student.foodStatus === "EATEN"
                  ? "COLLECTED"
                  : "NOT COLLECTED"}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "10px",
                marginBottom: "18px",
              }}
            >
              <InfoCard label="College" value={student.college} icon="🏫" />
              <InfoCard label="Department" value={student.department} icon="📚" />
              <InfoCard label="Phone" value={student.phone} icon="📱" />
              <InfoCard label="Gender" value={student.gender} icon="👤" />
            </div>

            {currentMeal && (
              <div
                style={{
                  padding: "15px",
                  borderRadius: "13px",
                  background: "#f0f6ff",
                  border: "1px solid #d7e7ff",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#5b78a6",
                    textTransform: "uppercase",
                    fontWeight: "800",
                    letterSpacing: "0.7px",
                  }}
                >
                  Verifying For
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#084298",
                  }}
                >
                  🍽️ {currentMeal.name}
                </div>

                <div
                  style={{
                    marginTop: "3px",
                    fontSize: "12px",
                    color: "#5f6f86",
                  }}
                >
                  {currentMeal.day} • {currentMeal.time}
                </div>
              </div>
            )}

            {student.foodStatus === "EATEN" ? (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "14px",
                  background: "#fff8e6",
                  border: "1px solid #f7d98c",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "17px",
                    }}
                  >
                    ✓
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#92400e",
                        fontWeight: "800",
                        fontSize: "15px",
                      }}
                    >
                      Food Already Collected
                    </div>

                    <div
                      style={{
                        color: "#a16207",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      This participant has already received this meal.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <SmallInfo
                    label="Collection Time"
                    value={student.foodTime || "Not available"}
                  />
                  <SmallInfo
                    label="Verified By"
                    value={student.verifiedBy || "Not available"}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "14px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "17px",
                    }}
                  >
                    🍽️
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#166534",
                        fontWeight: "800",
                        fontSize: "15px",
                      }}
                    >
                      Ready for Collection
                    </div>

                    <div
                      style={{
                        color: "#15803d",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      Participant is eligible to collect{" "}
                      {currentMeal?.name || "this meal"}.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleMarkFood}
                  disabled={loading}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: "10px",
                    background: loading ? "#94a3b8" : "#16a34a",
                    color: "#ffffff",
                    padding: "14px 18px",
                    fontSize: "15px",
                    fontWeight: "800",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
                  }}
                >
                  {loading
                    ? "Marking as Collected..."
                    : "Mark Food as Collected"}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// =====================================
// HELPER COMPONENTS
// =====================================

function InfoCard({ label, value, icon }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "12px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div style={{ fontSize: "18px" }}>{icon}</div>
      <div>
        <div
          style={{
            fontSize: "11px",
            color: "#64748b",
            fontWeight: "750",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: "#0f172a",
            fontSize: "14px",
            fontWeight: "650",
            marginTop: "2px",
          }}
        >
          {value || "N/A"}
        </div>
      </div>
    </div>
  );
}

function SmallInfo({ label, value }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "rgba(255,255,255,0.6)",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#92400e",
          fontWeight: "750",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: "#713f12",
          fontSize: "13px",
          fontWeight: "700",
          marginTop: "2px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default VolunteerDashboard;