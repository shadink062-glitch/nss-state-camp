const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzQ5cUH46d8HEiF0LEhTJhM7EaWCO_GgeG7sSA-FdNOplbc3fGLL4hj7M8Iwg6-5SG_/exec";

// CHANGED: how long we're willing to wait on Apps Script
// before giving up and telling the client clearly, instead
// of hanging until Vercel's own function timeout kills the
// request with a generic error.
const APPS_SCRIPT_TIMEOUT_MS = 9000;

export default async function handler(req, res) {

  // Only allow POST
  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });

  }

  // CHANGED: log only the action being requested, not the
  // full body (which includes student name/phone/email).
  console.log("Proxy request action:", req.body && req.body.action);

  // CHANGED: AbortController so a stuck Apps Script call
  // fails fast with a clear message instead of hanging.
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    APPS_SCRIPT_TIMEOUT_MS
  );

  try {

    // Send request to Apps Script
    const response = await fetch(
      APPS_SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          req.body
        ),

        redirect: "follow",

        signal: controller.signal,
      }
    );

    console.log(
      "Apps Script status:",
      response.status
    );

    const text =
      await response.text();

    // Try parsing JSON
    let data;

    try {

      data = JSON.parse(text);

    } catch (parseError) {

      console.error(
        "JSON parse error:",
        parseError
      );

      return res.status(502).json({

        success: false,

        message:
          "Apps Script returned non-JSON response",

        appsScriptStatus:
          response.status,

        response:
          text.substring(0, 1000),

      });

    }

    // IMPORTANT:
    // Always return JSON to React
    return res.status(200).json(
      data
    );

  } catch (error) {

    // CHANGED: distinguish a timeout from other failures so
    // the UI can show "that took too long, try again" instead
    // of a generic error.
    if (error.name === "AbortError") {

      console.error("Proxy error: Apps Script timed out");

      return res.status(504).json({

        success: false,

        message:
          "The server took too long to respond. Please try again.",

        timedOut: true,

      });

    }

    console.error(
      "Proxy error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Proxy request failed",

      error:
        error.message,

    });

  } finally {

    clearTimeout(timeout);

  }

}