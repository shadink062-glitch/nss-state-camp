import { useEffect, useState } from "react";

import {
  getCurrentMeal,
  setCurrentMeal,
  getStats,
  getStudents,
} from "../services/api";

function AdminDashboard() {
  // =====================================================
  // STATE
  // =====================================================

  const [currentMeal, setCurrentMealState] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [foodFilter, setFoodFilter] = useState("ALL");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // MEALS
  // =====================================================

  const meals = [
    { id: "M01", day: "Day 1", name: "Arrival Tea", time: "5:00 PM" },
    { id: "M02", day: "Day 1", name: "Dinner", time: "10:00 PM" },
    { id: "M03", day: "Day 2", name: "Bed Tea", time: "TBD" },
    { id: "M04", day: "Day 2", name: "Breakfast", time: "TBD" },
    { id: "M05", day: "Day 2", name: "Lunch", time: "1:00 PM" },
    { id: "M06", day: "Day 2", name: "Tea", time: "5:00 PM" },
    { id: "M07", day: "Day 2", name: "Dinner", time: "10:00 PM" },
    { id: "M08", day: "Day 3", name: "Bed Tea", time: "TBD" },
    { id: "M09", day: "Day 3", name: "Breakfast", time: "TBD" },
    { id: "M10", day: "Day 3", name: "Lunch", time: "TBD" },
    { id: "M11", day: "Day 3", name: "Tea", time: "TBD" },
  ];

  // =====================================================
  // STYLES
  // =====================================================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f7fb",
      padding: "24px",
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#172033",
    },

    container: {
      maxWidth: "1250px",
      margin: "0 auto",
    },

    header: {
      background: "#ffffff",
      borderRadius: "18px",
      padding: "24px 28px",
      marginBottom: "20px",
      border: "1px solid #e6eaf0",
      boxShadow: "0 5px 20px rgba(15, 23, 42, 0.05)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "20px",
      flexWrap: "wrap",
    },

    title: {
      margin: 0,
      fontSize: "30px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
      color: "#113e80",
    },

    subtitle: {
      margin: "6px 0 0",
      color: "#113e80",
      fontSize: "14px",
    },

    logout: {
      border: "none",
      borderRadius: "10px",
      padding: "11px 18px",
      background: "#fff1f2",
      color: "#dc2626",
      fontWeight: "700",
      cursor: "pointer",
      fontSize: "14px",
    },

    card: {
      background: "#ffffff",
      borderRadius: "18px",
      border: "1px solid #e6eaf0",
      boxShadow: "0 5px 20px rgba(15, 23, 42, 0.05)",
    },

    section: {
      padding: "25px",
      marginBottom: "20px",
    },

    sectionTitle: {
      margin: 0,
      fontSize: "21px",
      fontWeight: "800",
      color: "#172033",
    },

    sectionDescription: {
      margin: "6px 0 0",
      color: "#7a8494",
      fontSize: "14px",
    },

    mealHero: {
      padding: "28px",
      marginBottom: "20px",
      borderRadius: "18px",
      background:
        "linear-gradient(135deg, #0d6efd 0%, #2563eb 100%)",
      color: "#ffffff",
      boxShadow: "0 8px 25px rgba(37, 99, 235, 0.18)",
    },

    statGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "14px",
      marginTop: "20px",
    },

    statCard: {
      background: "#ffffff",
      border: "1px solid #e6eaf0",
      borderRadius: "15px",
      padding: "20px",
      minHeight: "105px",
    },

    statLabel: {
      fontSize: "12px",
      fontWeight: "800",
      color: "#7a8494",
      letterSpacing: "0.5px",
    },

    statValue: {
      marginTop: "8px",
      fontSize: "31px",
      fontWeight: "800",
      color: "#172033",
    },

    foodGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "14px",
      marginTop: "18px",
    },

    foodCard: {
      padding: "20px",
      borderRadius: "14px",
      border: "1px solid #e6eaf0",
      background: "#f8fafc",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "13px 14px",
      border: "1px solid #d9dee7",
      borderRadius: "10px",
      fontSize: "14px",
      outline: "none",
      background: "#ffffff",
    },

    select: {
      width: "100%",
      boxSizing: "border-box",
      padding: "13px 14px",
      border: "1px solid #d9dee7",
      borderRadius: "10px",
      fontSize: "14px",
      background: "#ffffff",
      outline: "none",
    },

    primaryButton: {
      width: "100%",
      border: "none",
      borderRadius: "10px",
      padding: "13px",
      background: "#0d6efd",
      color: "#ffffff",
      fontWeight: "800",
      fontSize: "14px",
      cursor: "pointer",
    },

    disabledButton: {
      width: "100%",
      border: "none",
      borderRadius: "10px",
      padding: "13px",
      background: "#cbd5e1",
      color: "#64748b",
      fontWeight: "800",
      fontSize: "14px",
      cursor: "not-allowed",
    },
  };

  // =====================================================
  // LOAD STATISTICS
  // =====================================================

  const loadStats = async (mealId) => {
    if (!mealId) {
      setStats(null);
      return;
    }

    try {
      setStatsLoading(true);

      console.log("Loading statistics for:", mealId);

      const result = await getStats(mealId);

      console.log("Stats response:", result);

      if (result && result.success === true) {
        setStats(result);
      } else {
        setStats(null);
        setError(
          result?.message ||
            "Could not load statistics."
        );
      }
    } catch (err) {
      console.error("Stats error:", err);

      setStats(null);

      setError(
        err?.message ||
          "Failed to load statistics."
      );
    } finally {
      setStatsLoading(false);
    }
  };

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);

      console.log("Loading students...");

      const result = await getStudents();

      console.log("Students response:", result);

      if (result && result.success === true) {
        setStudents(result.students || []);
      } else {
        setError(
          result?.message ||
            "Could not load students."
        );
      }
    } catch (err) {
      console.error("Students error:", err);

      setError(
        err?.message ||
          "Failed to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  // =====================================================
  // LOAD CURRENT MEAL
  // =====================================================

  const loadCurrentMeal = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getCurrentMeal();

      console.log(
        "Current meal response:",
        result
      );

      if (
        result &&
        result.success === true &&
        result.meal
      ) {
        setCurrentMealState(result.meal);
        setSelectedMeal(result.meal.id);

        await Promise.all([
          loadStats(result.meal.id),
          loadStudents(),
        ]);
      } else {
        setError(
          result?.message ||
            "Could not load current meal."
        );

        setStats(null);
      }
    } catch (err) {
      console.error(
        "Current meal error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load current meal."
      );

      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadCurrentMeal();
  }, []);

  // =====================================================
  // CHANGE CURRENT MEAL
  // =====================================================

  const handleChangeMeal = async () => {
    if (!selectedMeal) {
      setError("Please select a meal.");
      return;
    }

    setUpdating(true);
    setError("");
    setMessage("");

    try {
      console.log(
        "Changing current meal to:",
        selectedMeal
      );

      const result = await setCurrentMeal(
        selectedMeal
      );

      console.log(
        "Set meal response:",
        result
      );

      if (
        result &&
        result.success === true &&
        result.meal
      ) {
        setCurrentMealState(result.meal);
        setSelectedMeal(result.meal.id);

        await loadStats(result.meal.id);

        setMessage(
          "Current meal changed to " + result.meal.name + "."
        );
      } else {
        setError(
          result?.message ||
            "Could not change current meal."
        );
      }
    } catch (err) {
      console.error(
        "Change meal error:",
        err
      );

      setError(
        err?.message ||
          "Failed to change current meal."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "/admin/login";
  };

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = students.filter(
    (student) => {
      const search = searchTerm
        .trim()
        .toLowerCase();

      const matchesSearch =
        !search ||
        String(student.token || "")
          .toLowerCase()
          .includes(search) ||
        String(student.name || "")
          .toLowerCase()
          .includes(search) ||
        String(student.college || "")
          .toLowerCase()
          .includes(search) ||
        String(student.department || "")
          .toLowerCase()
          .includes(search);

      const matchesGender =
        genderFilter === "ALL" ||
        String(student.gender || "")
          .trim()
          .toUpperCase() === genderFilter;

      const normalizedFood =
        String(student.foodPreference || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");

      const matchesFood =
        foodFilter === "ALL" ||
        normalizedFood ===
          foodFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesGender &&
        matchesFood
      );
    }
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              NSS State Camp
            </h1>

            <p style={styles.subtitle}>
              Admin Control Center • 2026
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={styles.logout}
          >
            Logout
          </button>
        </div>

        {/* CURRENT MEAL */}

        <div style={styles.mealHero}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1px",
              opacity: 0.85,
              textTransform: "uppercase",
            }}
          >
            Currently Active
          </div>

          {loading ? (
            <div
              style={{
                marginTop: "10px",
                fontSize: "24px",
                fontWeight: "800",
              }}
            >
              Loading meal...
            </div>
          ) : currentMeal ? (
            <>
              <div
                style={{
                  marginTop: "7px",
                  fontSize: "32px",
                  fontWeight: "800",
                }}
              >
                🍽️ {currentMeal.name}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "15px",
                  opacity: 0.9,
                }}
              >
                {currentMeal.day}
                {" • "}
                {currentMeal.time}
                {" • "}
                {currentMeal.id}
              </div>
            </>
          ) : (
            <div
              style={{
                marginTop: "10px",
                fontWeight: "700",
              }}
            >
              No active meal loaded.
            </div>
          )}
        </div>

        {/* STATISTICS */}

        <div
          style={{
            ...styles.card,
            ...styles.section,
          }}
        >
          <div>
            <h2 style={styles.sectionTitle}>
              Overview
            </h2>

            <p style={styles.sectionDescription}>
              Registration and meal collection summary
            </p>
          </div>

          {statsLoading ? (
            <div
              style={{
                marginTop: "20px",
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
                background: "#f8fafc",
                borderRadius: "12px",
              }}
            >
              Loading statistics...
            </div>
          ) : stats ? (
            <>
              <div style={styles.statGrid}>

                <div style={styles.statCard}>
                  <div style={styles.statLabel}>
                    TOTAL STUDENTS
                  </div>

                  <div
                    style={{
                      ...styles.statValue,
                      color: "#2563eb",
                    }}
                  >
                    {stats.registrations?.total ?? 0}
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statLabel}>
                    MALE
                  </div>

                  <div style={styles.statValue}>
                    {stats.registrations?.male ?? 0}
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statLabel}>
                    FEMALE
                  </div>

                  <div style={styles.statValue}>
                    {stats.registrations?.female ?? 0}
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statLabel}>
                    VEGETARIAN
                  </div>

                  <div
                    style={{
                      ...styles.statValue,
                      color: "#198754",
                    }}
                  >
                    {stats.registrations?.vegetarian ?? 0}
                  </div>
                </div>

                <div style={styles.statCard}>
                  <div style={styles.statLabel}>
                    NON-VEGETARIAN
                  </div>

                  <div
                    style={{
                      ...styles.statValue,
                      color: "#d97706",
                    }}
                  >
                    {stats.registrations?.nonVegetarian ?? 0}
                  </div>
                </div>

              </div>

              <div
                style={{
                  marginTop: "28px",
                  paddingTop: "24px",
                  borderTop: "1px solid #edf0f4",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: "800",
                  }}
                >
                  🍽️ {currentMeal?.name} Collection
                </h3>

                <div style={styles.foodGrid}>

                  <div style={styles.foodCard}>
                    <div style={styles.statLabel}>
                      EXPECTED
                    </div>

                    <div style={styles.statValue}>
                      {stats.food?.total ?? 0}
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.foodCard,
                      background: "#ecfdf3",
                      borderColor: "#bbf7d0",
                    }}
                  >
                    <div
                      style={{
                        ...styles.statLabel,
                        color: "#15803d",
                      }}
                    >
                      COLLECTED
                    </div>

                    <div
                      style={{
                        ...styles.statValue,
                        color: "#15803d",
                      }}
                    >
                      {stats.food?.collected ?? 0}
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.foodCard,
                      background: "#fff1f2",
                      borderColor: "#fecdd3",
                    }}
                  >
                    <div
                      style={{
                        ...styles.statLabel,
                        color: "#be123c",
                      }}
                    >
                      REMAINING
                    </div>

                    <div
                      style={{
                        ...styles.statValue,
                        color: "#be123c",
                      }}
                    >
                      {stats.food?.notCollected ?? 0}
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.foodCard,
                      background: "#eff6ff",
                      borderColor: "#bfdbfe",
                    }}
                  >
                    <div
                      style={{
                        ...styles.statLabel,
                        color: "#1d4ed8",
                      }}
                    >
                      COLLECTION RATE
                    </div>

                    <div
                      style={{
                        ...styles.statValue,
                        color: "#1d4ed8",
                      }}
                    >
                      {stats.food?.percentage ?? 0}%
                    </div>
                  </div>

                </div>

                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#64748b",
                      marginBottom: "8px",
                    }}
                  >
                    <span>
                      Collection progress
                    </span>

                    <span>
                      {stats.food?.percentage ?? 0}%
                    </span>
                  </div>

                  <div
                    style={{
                      height: "9px",
                      background: "#e9eef5",
                      borderRadius: "20px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width:
                          Math.min(
                            100,
                            Math.max(
                              0,
                              Number(
                                stats.food?.percentage || 0
                              )
                            )
                          ) + "%",
                        background: "#0d6efd",
                        borderRadius: "20px",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px",
                  marginTop: "24px",
                }}
              >

                <div
                  style={{
                    padding: "20px",
                    border: "1px solid #e6eaf0",
                    borderRadius: "14px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 14px",
                      fontSize: "16px",
                    }}
                  >
                    🏫 Colleges
                  </h3>

                  {Object.entries(
                    stats.colleges || {}
                  ).length === 0 ? (
                    <div
                      style={{
                        color: "#7a8494",
                        fontSize: "14px",
                      }}
                    >
                      No college data available.
                    </div>
                  ) : (
                    Object.entries(
                      stats.colleges || {}
                    ).map(
                      ([college, count]) => (
                        <div
                          key={college}
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                            padding: "10px 0",
                            borderBottom:
                              "1px solid #f0f2f5",
                            fontSize: "14px",
                          }}
                        >
                          <span>
                            {college}
                          </span>

                          <strong>
                            {count}
                          </strong>
                        </div>
                      )
                    )
                  )}
                </div>

                <div
                  style={{
                    padding: "20px",
                    border: "1px solid #e6eaf0",
                    borderRadius: "14px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 14px",
                      fontSize: "16px",
                    }}
                  >
                    📚 Departments
                  </h3>

                  {Object.entries(
                    stats.departments || {}
                  ).length === 0 ? (
                    <div
                      style={{
                        color: "#7a8494",
                        fontSize: "14px",
                      }}
                    >
                      No department data available.
                    </div>
                  ) : (
                    Object.entries(
                      stats.departments || {}
                    ).map(
                      ([department, count]) => (
                        <div
                          key={department}
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                            padding: "10px 0",
                            borderBottom:
                              "1px solid #f0f2f5",
                            fontSize: "14px",
                          }}
                        >
                          <span>
                            {department}
                          </span>

                          <strong>
                            {count}
                          </strong>
                        </div>
                      )
                    )
                  )}
                </div>

              </div>
            </>
          ) : (
            <div
              style={{
                marginTop: "20px",
                padding: "25px",
                background: "#f8fafc",
                borderRadius: "12px",
                color: "#64748b",
              }}
            >
              Statistics are not available yet.
            </div>
          )}
        </div>

        {/* MEAL CONTROL */}

        <div
          style={{
            ...styles.card,
            ...styles.section,
          }}
        >
          <h2 style={styles.sectionTitle}>
            Meal Control
          </h2>

          <p style={styles.sectionDescription}>
            Select the meal currently being served.
            Volunteers will automatically use this meal.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(250px, 1fr) 220px",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <select
              value={selectedMeal}
              onChange={(e) =>
                setSelectedMeal(e.target.value)
              }
              style={styles.select}
            >
              <option value="">
                Select a meal
              </option>

              {meals.map((meal) => (
                <option
                  key={meal.id}
                  value={meal.id}
                >
                  {meal.id} — {meal.day} —{" "}
                  {meal.name} — {meal.time}
                </option>
              ))}
            </select>

            <button
              onClick={handleChangeMeal}
              disabled={
                updating ||
                !selectedMeal ||
                selectedMeal === currentMeal?.id
              }
              style={
                updating ||
                !selectedMeal ||
                selectedMeal === currentMeal?.id
                  ? styles.disabledButton
                  : styles.primaryButton
              }
            >
              {updating
                ? "UPDATING..."
                : "SET CURRENT MEAL"}
            </button>
          </div>
        </div>

        {/* MEAL SCHEDULE */}

        <div
          style={{
            ...styles.card,
            ...styles.section,
          }}
        >
          <h2 style={styles.sectionTitle}>
            Camp Meal Schedule
          </h2>

          <p style={styles.sectionDescription}>
            Full schedule for the three-day camp.
          </p>

          <div
            style={{
              marginTop: "18px",
              display: "grid",
              gap: "9px",
            }}
          >
            {meals.map((meal) => {
              const isCurrent =
                currentMeal?.id === meal.id;

              return (
                <div
                  key={meal.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "15px",
                    padding: "15px 17px",
                    borderRadius: "12px",
                    border: isCurrent
                      ? "1px solid #86efac"
                      : "1px solid #e6eaf0",
                    background: isCurrent
                      ? "#f0fdf4"
                      : "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        minWidth: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isCurrent
                          ? "#dcfce7"
                          : "#f1f5f9",
                        color: isCurrent
                          ? "#15803d"
                          : "#475569",
                        fontWeight: "800",
                        fontSize: "12px",
                      }}
                    >
                      {meal.id}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: "800",
                          fontSize: "14px",
                        }}
                      >
                        {meal.name}
                      </div>

                      <div
                        style={{
                          marginTop: "3px",
                          color: "#7a8494",
                          fontSize: "13px",
                        }}
                      >
                        {meal.day} • {meal.time}
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        background: "#198754",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: "800",
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STUDENT MANAGEMENT */}

        <div
          style={{
            ...styles.card,
            ...styles.section,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={styles.sectionTitle}>
                Student Management
              </h2>

              <p style={styles.sectionDescription}>
                Search and filter registered participants.
              </p>
            </div>

            <button
              onClick={loadStudents}
              disabled={studentsLoading}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "11px 17px",
                background: studentsLoading
                  ? "#cbd5e1"
                  : "#0d6efd",
                color: "#ffffff",
                fontWeight: "800",
                cursor: studentsLoading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {studentsLoading
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(250px, 2fr) repeat(2, minmax(150px, 1fr))",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <input
              type="text"
              placeholder="Search token, name, college, department..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              style={styles.input}
            />

            <select
              value={genderFilter}
              onChange={(e) =>
                setGenderFilter(e.target.value)
              }
              style={styles.select}
            >
              <option value="ALL">
                All Genders
              </option>

              <option value="MALE">
                Male
              </option>

              <option value="FEMALE">
                Female
              </option>
            </select>

            <select
              value={foodFilter}
              onChange={(e) =>
                setFoodFilter(e.target.value)
              }
              style={styles.select}
            >
              <option value="ALL">
                All Food
              </option>

              <option value="VEGETARIAN">
                Vegetarian
              </option>

              <option value="NON-VEGETARIAN">
                Non-Vegetarian
              </option>
            </select>
          </div>

          <div
            style={{
              marginTop: "15px",
              marginBottom: "12px",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Showing{" "}
            <strong>
              {filteredStudents.length}
            </strong>{" "}
            of{" "}
            <strong>
              {students.length}
            </strong>{" "}
            students
          </div>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e6eaf0",
              borderRadius: "13px",
            }}
          >
            {studentsLoading ? (
              <div
                style={{
                  padding: "50px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div
                style={{
                  padding: "50px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                No students found.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1000px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                    }}
                  >
                    {[
                      "Token",
                      "Name",
                      "College",
                      "Department",
                      "Gender",
                      "Phone",
                      "Food",
                      "Registered",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "13px",
                          textAlign: "left",
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: "800",
                          whiteSpace: "nowrap",
                          borderBottom:
                            "1px solid #e6eaf0",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(
                    (student, index) => (
                      <tr
                        key={
                          student.token || index
                        }
                        style={{
                          borderBottom:
                            "1px solid #f0f2f5",
                        }}
                      >
                        <td
                          style={{
                            padding: "13px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            fontWeight: "800",
                            color: "#2563eb",
                          }}
                        >
                          {student.token}
                        </td>

                        <td
                          style={{
                            padding: "13px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            fontWeight: "700",
                          }}
                        >
                          {student.name}
                        </td>

                        <td
                          style={{
                            padding: "13px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.college}
                        </td>

                        <td
                          style={{
                            padding: "13px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.department}
                        </td>

                        <td
                          style={{
                            padding: "13px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.gender}
                        </td>

                        <td
                          style={{
                            padding: "13px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {student.phone}
                        </td>

                        <td
                          style={{
                            padding: "13px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              padding:
                                "5px 8px",
                              borderRadius:
                                "7px",
                              background:
                                String(
                                  student.foodPreference ||
                                    ""
                                )
                                  .toLowerCase()
                                  .includes(
                                    "vegetarian"
                                  )
                                  &&
                                !String(
                                  student.foodPreference ||
                                    ""
                                )
                                  .toLowerCase()
                                  .includes(
                                    "non"
                                  )
                                  ? "#ecfdf3"
                                  : "#fff7ed",
                              color:
                                String(
                                  student.foodPreference ||
                                    ""
                                )
                                  .toLowerCase()
                                  .includes(
                                    "vegetarian"
                                  )
                                  &&
                                !String(
                                  student.foodPreference ||
                                    ""
                                )
                                  .toLowerCase()
                                  .includes(
                                    "non"
                                  )
                                  ? "#15803d"
                                  : "#c2410c",
                              fontWeight:
                                "700",
                            }}
                          >
                            {
                              student.foodPreference ||
                              "-"
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "13px",
                            fontSize: "13px",
                            whiteSpace: "nowrap",
                            color: "#64748b",
                          }}
                        >
                          {student.registrationDate
                            ? new Date(
                                student.registrationDate
                              ).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* MESSAGES */}

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "14px 16px",
              borderRadius: "11px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {message && (
          <div
            style={{
              marginTop: "15px",
              padding: "14px 16px",
              borderRadius: "11px",
              background: "#ecfdf3",
              border: "1px solid #bbf7d0",
              color: "#15803d",
              fontWeight: "700",
              fontSize: "14px",
            }}
          >
            ✅ {message}
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            padding: "25px 0 10px",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          NSS State Camp 2026 • Admin Panel
        </div>
      </div>

      <style>
        {`
          @media (max-width: 700px) {
            body {
              margin: 0;
            }

            .admin-mobile-fix {
              width: 100%;
            }
          }

          @media (max-width: 650px) {
            select,
            input,
            button {
              max-width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AdminDashboard;
