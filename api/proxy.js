const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzQWKr4YDlVfziweV_RQq0tTJCb4lg9x1eVWDKiYO1tmbuNVA9J2Shn1WhQevlF1ls8/exec";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }

    console.log("Request body:", req.body);

    // Send request to Apps Script WITHOUT automatically following
    // Google's redirect.
    const appsScriptResponse = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
      redirect: "manual",
    });

    console.log("Apps Script status:", appsScriptResponse.status);
    console.log(
      "Apps Script location:",
      appsScriptResponse.headers.get("location")
    );

    // Apps Script normally responds with a redirect.
    const redirectUrl = appsScriptResponse.headers.get("location");

    if (redirectUrl) {
      const finalResponse = await fetch(redirectUrl, {
        method: "GET",
      });

      const text = await finalResponse.text();

      console.log("Final Apps Script status:", finalResponse.status);
      console.log("Final Apps Script response:", text);

      try {
        const data = JSON.parse(text);

        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Apps Script returned non-JSON data",
          response: text.substring(0, 1000),
        });
      }
    }

    // If there was no redirect, try reading the response directly.
    const text = await appsScriptResponse.text();

    console.log("Direct Apps Script response:", text);

    try {
      const data = JSON.parse(text);

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Apps Script returned non-JSON data",
        response: text.substring(0, 1000),
      });
    }
  } catch (error) {
    console.error("Proxy error:", error);

    return res.status(500).json({
      success: false,
      message: "Proxy request failed",
      error: error.message,
    });
  }
}