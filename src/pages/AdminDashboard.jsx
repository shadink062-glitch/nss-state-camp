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

  const [currentMeal, setCurrentMealState] =
    useState(null);

  const [selectedMeal, setSelectedMeal] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [stats, setStats] =
    useState(null);

  const [statsLoading, setStatsLoading] =
    useState(false);

  const [students, setStudents] =
    useState([]);

  const [studentsLoading, setStudentsLoading] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [genderFilter, setGenderFilter] =
    useState("ALL");

  const [foodFilter, setFoodFilter] =
    useState("ALL");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // =====================================================
  // TABLE STYLES
  // =====================================================

  const tableHeaderStyle = {
    padding: "14px 12px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "bold",
    color: "#495057",
    whiteSpace: "nowrap",
  };

  const tableCellStyle = {
    padding: "13px 12px",
    fontSize: "14px",
    whiteSpace: "nowrap",
  };


  // =====================================================
  // MEAL LIST
  // =====================================================

  const meals = [

    {
      id: "M01",
      day: "Day 1",
      name: "Arrival Tea",
      time: "5:00 PM",
    },

    {
      id: "M02",
      day: "Day 1",
      name: "Dinner",
      time: "10:00 PM",
    },

    {
      id: "M03",
      day: "Day 2",
      name: "Bed Tea",
      time: "TBD",
    },

    {
      id: "M04",
      day: "Day 2",
      name: "Breakfast",
      time: "TBD",
    },

    {
      id: "M05",
      day: "Day 2",
      name: "Lunch",
      time: "1:00 PM",
    },

    {
      id: "M06",
      day: "Day 2",
      name: "Tea",
      time: "5:00 PM",
    },

    {
      id: "M07",
      day: "Day 2",
      name: "Dinner",
      time: "10:00 PM",
    },

    {
      id: "M08",
      day: "Day 3",
      name: "Bed Tea",
      time: "TBD",
    },

    {
      id: "M09",
      day: "Day 3",
      name: "Breakfast",
      time: "TBD",
    },

    {
      id: "M10",
      day: "Day 3",
      name: "Lunch",
      time: "TBD",
    },

    {
      id: "M11",
      day: "Day 3",
      name: "Tea",
      time: "TBD",
    },

  ];


  // =====================================================
  // LOAD STATS
  // =====================================================

  const loadStats = async (mealId) => {

    if (!mealId) {
      return;
    }

    try {

      setStatsLoading(true);

      const result =
        await getStats(mealId);

      console.log(
        "Stats:",
        result
      );

      if (result.success) {

        setStats(result);

      } else {

        console.error(
          result.message ||
          "Could not load stats."
        );

      }

    } catch (err) {

      console.error(
        "Stats error:",
        err
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

      const result =
        await getStudents();

      console.log(
        "Students:",
        result
      );

      if (result.success) {

        setStudents(
          result.students || []
        );

      } else {

        console.error(
          result.message ||
          "Could not load students."
        );

      }

    } catch (err) {

      console.error(
        "Students error:",
        err
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

      const result =
        await getCurrentMeal();

      console.log(
        "Current meal:",
        result
      );


      if (result.success) {

        setCurrentMealState(
          result.meal
        );

        setSelectedMeal(
          result.meal.id
        );

        await loadStats(
          result.meal.id
        );

      } else {

        setError(
          result.message ||
          "Could not load current meal."
        );

      }

    } catch (err) {

      console.error(
        "Current meal error:",
        err
      );

      setError(
        "Failed to load current meal."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadCurrentMeal();

    loadStudents();

  }, []);


  // =====================================================
  // CHANGE CURRENT MEAL
  // =====================================================

  const handleChangeMeal = async () => {

    if (!selectedMeal) {

      setError(
        "Please select a meal."
      );

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


      const result =
        await setCurrentMeal(
          selectedMeal
        );


      console.log(
        "Set meal response:",
        result
      );


      if (result.success) {

        setCurrentMealState(
          result.meal
        );


        await loadStats(
          result.meal.id
        );


        setMessage(
          `Current meal changed to ${result.meal.name}.`
        );

      } else {

        setError(
          result.message ||
          "Could not change current meal."
        );

      }

    } catch (err) {

      console.error(
        "Change meal error:",
        err
      );

      setError(
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

    localStorage.removeItem(
      "adminLoggedIn"
    );

    window.location.href =
      "/admin/login";

  };


  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents =
    students.filter(
      (student) => {

        const search =
          searchTerm
            .trim()
            .toLowerCase();


        const matchesSearch =
          !search ||
          String(
            student.token || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            student.name || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            student.college || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            student.department || ""
          )
            .toLowerCase()
            .includes(search);


        const matchesGender =
          genderFilter === "ALL" ||
          String(
            student.gender || ""
          )
            .trim()
            .toUpperCase() ===
            genderFilter;


        const normalizedFood =
          String(
            student.foodPreference || ""
          )
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

    <div
      style={{
        minHeight: "100vh",
        padding: "30px 20px",
        background: "#f5f7fa",
      }}
    >

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            gap: "15px",
          }}
        >

          <div>

            <h1
              style={{
                margin: 0,
                fontSize: "30px",
              }}
            >
              Admin Dashboard
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#666",
              }}
            >
              NSS State Camp 2026
            </p>

          </div>


          <button
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#dc3545",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Logout
          </button>

        </div>


        {/* =================================================
            CURRENT ACTIVE MEAL
        ================================================= */}

        <div
          style={{
            padding: "25px",
            borderRadius: "14px",
            background: "#e7f1ff",
            border:
              "1px solid #b6d4fe",
            marginBottom: "30px",
          }}
        >

          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#084298",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Current Active Meal
          </div>


          {loading ? (

            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Loading...
            </div>

          ) : currentMeal ? (

            <>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#084298",
                }}
              >
                🍽️ {currentMeal.name}
              </div>


              <div
                style={{
                  marginTop: "8px",
                  fontSize: "17px",
                  color: "#495057",
                }}
              >
                {currentMeal.day}
                {" • "}
                {currentMeal.time}
              </div>


              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#6c757d",
                }}
              >
                Meal ID:{" "}
                <strong>
                  {currentMeal.id}
                </strong>
              </div>

            </>

          ) : (

            <div
              style={{
                color: "#842029",
                fontWeight: "bold",
              }}
            >
              No current meal loaded.
            </div>

          )}

        </div>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div
          style={{
            marginBottom: "30px",
          }}
        >

          <div
            style={{
              marginBottom: "20px",
            }}
          >

            <h2
              style={{
                margin: 0,
              }}
            >
              Camp Statistics
            </h2>


            {currentMeal && (

              <p
                style={{
                  marginTop: "6px",
                  color: "#666",
                }}
              >
                Statistics for{" "}
                <strong>
                  {currentMeal.name}
                </strong>
                {" "}
                ({currentMeal.id})
              </p>

            )}

          </div>


          {statsLoading ? (

            <div
              style={{
                padding: "30px",
                textAlign: "center",
                border:
                  "1px solid #ddd",
                borderRadius: "12px",
                color: "#666",
              }}
            >
              Loading statistics...
            </div>

          ) : stats ? (

            <>


              {/* REGISTRATION CARDS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >


                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "#f0f6ff",
                    border:
                      "1px solid #cfe2ff",
                  }}
                >

                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    TOTAL STUDENTS
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: "#084298",
                    }}
                  >
                    {
                      stats.registrations.total
                    }
                  </div>

                </div>


                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "#eef7ff",
                    border:
                      "1px solid #cfe2ff",
                  }}
                >

                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    MALE
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: "bold",
                    }}
                  >
                    {
                      stats.registrations.male
                    }
                  </div>

                </div>


                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "#fff0f5",
                    border:
                      "1px solid #f5c2d7",
                  }}
                >

                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    FEMALE
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: "bold",
                    }}
                  >
                    {
                      stats.registrations.female
                    }
                  </div>

                </div>


                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "#edf8f0",
                    border:
                      "1px solid #c3e6cb",
                  }}
                >

                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    VEGETARIAN
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: "bold",
                    }}
                  >
                    {
                      stats.registrations
                        .vegetarian
                    }
                  </div>

                </div>


                <div
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "#fff8e6",
                    border:
                      "1px solid #ffe69c",
                  }}
                >

                  <div
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    NON-VEGETARIAN
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "32px",
                      fontWeight: "bold",
                    }}
                  >
                    {
                      stats.registrations
                        .nonVegetarian
                    }
                  </div>

                </div>

              </div>


              {/* FOOD COLLECTION */}

              <div
                style={{
                  padding: "25px",
                  borderRadius: "14px",
                  background: "#f8f9fa",
                  border:
                    "1px solid #ddd",
                  marginBottom: "20px",
                }}
              >

                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "20px",
                  }}
                >
                  🍽️{" "}
                  {currentMeal?.name}
                  {" "}Collection
                </h3>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "15px",
                  }}
                >

                  <div
                    style={{
                      padding: "18px",
                      background: "white",
                      borderRadius: "10px",
                      border:
                        "1px solid #ddd",
                    }}
                  >

                    <div
                      style={{
                        color: "#666",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      EXPECTED
                    </div>

                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "28px",
                        fontWeight: "bold",
                      }}
                    >
                      {
                        stats.food.total
                      }
                    </div>

                  </div>


                  <div
                    style={{
                      padding: "18px",
                      background: "#d1e7dd",
                      borderRadius: "10px",
                      border:
                        "1px solid #a3cfbb",
                    }}
                  >

                    <div
                      style={{
                        color: "#0f5132",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      COLLECTED
                    </div>

                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: "#0f5132",
                      }}
                    >
                      {
                        stats.food.collected
                      }
                    </div>

                  </div>


                  <div
                    style={{
                      padding: "18px",
                      background: "#f8d7da",
                      borderRadius: "10px",
                      border:
                        "1px solid #f1aeb5",
                    }}
                  >

                    <div
                      style={{
                        color: "#842029",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      NOT COLLECTED
                    </div>

                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: "#842029",
                      }}
                    >
                      {
                        stats.food.notCollected
                      }
                    </div>

                  </div>


                  <div
                    style={{
                      padding: "18px",
                      background: "#e7f1ff",
                      borderRadius: "10px",
                      border:
                        "1px solid #b6d4fe",
                    }}
                  >

                    <div
                      style={{
                        color: "#084298",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      COLLECTION %
                    </div>

                    <div
                      style={{
                        marginTop: "7px",
                        fontSize: "28px",
                        fontWeight: "bold",
                        color: "#084298",
                      }}
                    >
                      {
                        stats.food.percentage
                      }%
                    </div>

                  </div>

                </div>

              </div>


              {/* COLLEGES + DEPARTMENTS */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >


                <div
                  style={{
                    padding: "22px",
                    border:
                      "1px solid #ddd",
                    borderRadius: "12px",
                  }}
                >

                  <h3
                    style={{
                      marginTop: 0,
                    }}
                  >
                    🏫 Colleges
                  </h3>


                  {Object.entries(
                    stats.colleges || {}
                  ).map(
                    ([college, count]) => (

                      <div
                        key={college}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          padding:
                            "10px 0",
                          borderBottom:
                            "1px solid #eee",
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
                  )}

                </div>


                <div
                  style={{
                    padding: "22px",
                    border:
                      "1px solid #ddd",
                    borderRadius: "12px",
                  }}
                >

                  <h3
                    style={{
                      marginTop: 0,
                    }}
                  >
                    📚 Departments
                  </h3>


                  {Object.entries(
                    stats.departments || {}
                  ).map(
                    ([department, count]) => (

                      <div
                        key={department}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          padding:
                            "10px 0",
                          borderBottom:
                            "1px solid #eee",
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
                  )}

                </div>

              </div>

            </>

          ) : (

            <div
              style={{
                padding: "25px",
                borderRadius: "12px",
                background: "#f8f9fa",
                border:
                  "1px solid #ddd",
                color: "#666",
              }}
            >
              Statistics are not available yet.
            </div>

          )}

        </div>


        {/* =================================================
            CHANGE CURRENT MEAL
        ================================================= */}

        <div
          style={{
            padding: "25px",
            border:
              "1px solid #ddd",
            borderRadius: "14px",
            marginBottom: "30px",
          }}
        >

          <h2
            style={{
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Change Current Meal
          </h2>


          <p
            style={{
              color: "#666",
              marginBottom: "20px",
            }}
          >
            Select the meal currently being
            served. All volunteer dashboards
            will use this meal automatically.
          </p>


          <select
            value={selectedMeal}
            onChange={(e) =>
              setSelectedMeal(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "14px",
              border:
                "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "16px",
              marginBottom: "15px",
              background: "white",
            }}
          >

            <option value="">
              Select a meal
            </option>


            {meals.map(
              (meal) => (

                <option
                  key={meal.id}
                  value={meal.id}
                >
                  {meal.id}
                  {" — "}
                  {meal.day}
                  {" — "}
                  {meal.name}
                  {" — "}
                  {meal.time}
                </option>

              )
            )}

          </select>


          <button
            onClick={
              handleChangeMeal
            }
            disabled={
              updating ||
              !selectedMeal ||
              selectedMeal ===
                currentMeal?.id
            }
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: "9px",
              background:
                updating ||
                !selectedMeal ||
                selectedMeal ===
                  currentMeal?.id
                  ? "#6c757d"
                  : "#0d6efd",
              color: "white",
              fontSize: "17px",
              fontWeight: "bold",
              cursor:
                updating ||
                !selectedMeal ||
                selectedMeal ===
                  currentMeal?.id
                  ? "not-allowed"
                  : "pointer",
            }}
          >

            {updating
              ? "UPDATING..."
              : "SET CURRENT MEAL"}

          </button>

        </div>


        {/* =================================================
            CAMP MEAL SCHEDULE
        ================================================= */}

        <div>

          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            Camp Meal Schedule
          </h2>


          {meals.map(
            (meal) => {

              const isCurrent =
                currentMeal?.id ===
                meal.id;


              return (

                <div
                  key={meal.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "15px",
                    padding: "16px",
                    marginBottom: "10px",
                    borderRadius: "10px",
                    border:
                      isCurrent
                        ? "2px solid #198754"
                        : "1px solid #ddd",
                    background:
                      isCurrent
                        ? "#d1e7dd"
                        : "#ffffff",
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {meal.id}
                      {" — "}
                      {meal.name}
                    </div>


                    <div
                      style={{
                        marginTop: "4px",
                        color: "#666",
                      }}
                    >
                      {meal.day}
                      {" • "}
                      {meal.time}
                    </div>

                  </div>


                  {isCurrent && (

                    <span
                      style={{
                        padding:
                          "6px 10px",
                        borderRadius:
                          "20px",
                        background:
                          "#198754",
                        color:
                          "white",
                        fontSize:
                          "12px",
                        fontWeight:
                          "bold",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      ACTIVE
                    </span>

                  )}

                </div>

              );

            }
          )}

        </div>


        {/* =================================================
            STUDENT MANAGEMENT
        ================================================= */}

        <div
          style={{
            marginTop: "40px",
            paddingTop: "30px",
            borderTop:
              "2px solid #eee",
          }}
        >

          {/* STUDENT HEADER */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <h2
                style={{
                  margin: 0,
                }}
              >
                Student Management
              </h2>


              <p
                style={{
                  marginTop: "6px",
                  color: "#666",
                }}
              >
                {
                  filteredStudents.length
                }{" "}
                of{" "}
                {
                  students.length
                }{" "}
                students shown
              </p>

            </div>


            <button
              onClick={loadStudents}
              disabled={
                studentsLoading
              }
              style={{
                padding:
                  "10px 18px",
                border: "none",
                borderRadius: "8px",
                background:
                  "#0d6efd",
                color: "white",
                fontWeight:
                  "bold",
                cursor:
                  studentsLoading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {studentsLoading
                ? "REFRESHING..."
                : "↻ REFRESH"}
            </button>

          </div>


          {/* SEARCH + FILTERS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(250px, 2fr) repeat(2, minmax(160px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >

            <input
              type="text"
              placeholder="Search token, name, college, department..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding:
                  "13px",
                border:
                  "1px solid #ccc",
                borderRadius:
                  "8px",
                fontSize:
                  "15px",
                boxSizing:
                  "border-box",
              }}
            />


            <select
              value={genderFilter}
              onChange={(e) =>
                setGenderFilter(
                  e.target.value
                )
              }
              style={{
                padding:
                  "13px",
                border:
                  "1px solid #ccc",
                borderRadius:
                  "8px",
                fontSize:
                  "15px",
                background:
                  "white",
              }}
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
                setFoodFilter(
                  e.target.value
                )
              }
              style={{
                padding:
                  "13px",
                border:
                  "1px solid #ccc",
                borderRadius:
                  "8px",
                fontSize:
                  "15px",
                background:
                  "white",
              }}
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


          {/* STUDENT TABLE */}

          <div
            style={{
              overflowX:
                "auto",
              border:
                "1px solid #ddd",
              borderRadius:
                "12px",
            }}
          >

            {studentsLoading ? (

              <div
                style={{
                  padding:
                    "40px",
                  textAlign:
                    "center",
                  color:
                    "#666",
                }}
              >
                Loading students...
              </div>

            ) : filteredStudents.length ===
              0 ? (

              <div
                style={{
                  padding:
                    "40px",
                  textAlign:
                    "center",
                  color:
                    "#666",
                }}
              >
                No students found.
              </div>

            ) : (

              <table
                style={{
                  width:
                    "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "1000px",
                }}
              >

                <thead>

                  <tr
                    style={{
                      background:
                        "#f5f7fa",
                    }}
                  >

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Token
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Name
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      College
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Department
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Gender
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Phone
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Food
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Registered
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredStudents.map(
                    (
                      student,
                      index
                    ) => (

                      <tr
                        key={
                          student.token ||
                          index
                        }
                        style={{
                          borderTop:
                            "1px solid #eee",
                        }}
                      >

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <strong>
                            {
                              student.token
                            }
                          </strong>
                        </td>


                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            student.name
                          }
                        </td>


                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            student.college
                          }
                        </td>


                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            student.department
                          }
                        </td>


                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            student.gender
                          }
                        </td>


                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            student.phone
                          }
                        </td>


                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            student.foodPreference
                          }
                        </td>


                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {
                            student.registrationDate
                              ? new Date(
                                  student.registrationDate
                                ).toLocaleString()
                              : "-"
                          }
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

          </div>

        </div>


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div
            style={{
              marginTop:
                "20px",
              padding:
                "15px",
              borderRadius:
                "8px",
              background:
                "#f8d7da",
              color:
                "#842029",
              fontWeight:
                "bold",
            }}
          >
            ❌ {error}
          </div>

        )}


        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (

          <div
            style={{
              marginTop:
                "20px",
              padding:
                "15px",
              borderRadius:
                "8px",
              background:
                "#d1e7dd",
              color:
                "#0f5132",
              fontWeight:
                "bold",
            }}
          >
            ✅ {message}
          </div>

        )}

      </div>

    </div>

  );

}


export default AdminDashboard;