const API_URL = "/api/proxy";

async function sendRequest(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  return result;
}

// ===============================
// STUDENT REGISTRATION
// ===============================
export const registerStudent = async (studentData) => {
  return sendRequest({
    action: "register",
    ...studentData,
  });
};

// ===============================
// GET STUDENT
// ===============================
export const getStudent = async (token) => {
  return sendRequest({
    action: "getStudent",
    token,
  });
};

// ===============================
// GET CURRENT MEAL
// ===============================
export const getCurrentMeal = async () => {
  return sendRequest({
    action: "getCurrentMeal",
  });
};

// ===============================
// MARK FOOD
// ===============================
export const markFood = async (
  token,
  mealId,
  volunteerId
) => {
  return sendRequest({
    action: "markFood",
    token,
    mealId,
    volunteerId,
  });
};

// ===============================
// GET STATS
// ===============================
export const getStats = async (mealId) => {
  return sendRequest({
    action: "getStats",
    mealId,
  });
};

// ===============================
// GET STUDENTS
// ===============================
export const getStudents = async () => {
  return sendRequest({
    action: "getStudents",
  });
};

// ===============================
// SET CURRENT MEAL
// ===============================
export const setCurrentMeal = async (mealId) => {
  return sendRequest({
    action: "setCurrentMeal",
    mealId,
  });
};