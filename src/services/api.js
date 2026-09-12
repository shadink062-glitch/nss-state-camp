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

export const registerStudent = async (studentData) => {
  return sendRequest({
    action: "register",
    ...studentData,
  });
};

export const getStudent = async (token) => {
  return sendRequest({
    action: "getStudent",
    token,
  });
};

export const markFood = async (token, volunteerId) => {
  return sendRequest({
    action: "markFood",
    token,
    volunteerId,
  });
};

export const getStats = async () => {
  return sendRequest({
    action: "getStats",
  });
};

export const getStudents = async () => {
  return sendRequest({
    action: "getStudents",
  });
};