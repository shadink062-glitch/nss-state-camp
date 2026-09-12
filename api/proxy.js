const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzQ5cUH46d8HEiF0LEhTJhM7EaWCO_GgeG7sSA-FdNOplbc3fGLL4hj7M8Iwg6-5SG_/exec";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }

    console.log("Request body:", req.body);

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
      redirect: "follow",
    });

    const responseText = await response.text();

    console.log("Apps Script response:", responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Apps Script did not return JSON",
        response: responseText,
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Proxy error:", error);

    return res.status(500).json({
      success: false,
      message: "Proxy request failed",
      error: error.message,
    });
  }
}