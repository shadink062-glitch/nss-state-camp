const API_URL = "/api/proxy";

async function sendRequest(data) {
  console.log("API request:", data);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await response.text();

  console.log(
    "API HTTP status:",
    response.status
  );

  console.log(
    "API raw response:",
    text
  );

  if (!response.ok) {
    throw new Error(
      `API request failed (${response.status})`
    );
  }

  if (!text) {
    throw new Error(
      "API returned an empty response"
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      "API returned invalid JSON"
    );
  }
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
export const getStudent = async (token, mealId) => {
  return sendRequest({
    action: "getStudent",
    token,
    mealId,
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