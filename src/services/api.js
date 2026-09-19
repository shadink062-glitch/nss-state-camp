const API_URL = "/api/proxy";

// CHANGED: actions here are safe to retry once if the first
// attempt times out or drops — they don't write anything, so
// retrying can't create a duplicate registration or a double
// food-mark. "register" and "markFood" are deliberately left
// out of this list.
const RETRYABLE_ACTIONS = new Set([
  "getStudent",
  "getCurrentMeal",
  "getStats",
  "getStudents",
]);

// CHANGED: how long we wait for our own proxy before giving
// up client-side. Set slightly above the proxy's own 9s
// Apps Script timeout so the proxy's clearer error message
// gets a chance to come back first.
const REQUEST_TIMEOUT_MS = 11000;

async function sendRequest(data, attempt = 1) {
  console.log("API request:", data.action);

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  let response;

  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);

    const isAbort = err.name === "AbortError";

    if (
      isAbort &&
      attempt === 1 &&
      RETRYABLE_ACTIONS.has(data.action)
    ) {
      console.log("API request timed out, retrying once:", data.action);
      return sendRequest(data, 2);
    }

    throw new Error(
      isAbort
        ? "The request took too long. Please check your connection and try again."
        : "Could not reach the server. Please try again."
    );
  }

  clearTimeout(timeout);

  const text = await response.text();

  console.log("API HTTP status:", response.status);

  if (!response.ok) {
    // A 504 from our proxy means Apps Script itself timed out.
    if (
      response.status === 504 &&
      attempt === 1 &&
      RETRYABLE_ACTIONS.has(data.action)
    ) {
      console.log("Apps Script timed out, retrying once:", data.action);
      return sendRequest(data, 2);
    }

    throw new Error(`API request failed (${response.status})`);
  }

  if (!text) {
    throw new Error("API returned an empty response");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("API returned invalid JSON");
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