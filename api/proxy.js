const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzQ5cUH46d8HEiF0LEhTJhM7EaWCO_GgeG7sSA-FdNOplbc3fGLL4hj7M8Iwg6-5SG_/exec";


export default async function handler(req, res) {

  // Only allow POST
  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });

  }


  try {

    console.log(
      "Proxy request:",
      req.body
    );


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
      }
    );


    console.log(
      "Apps Script status:",
      response.status
    );


    const text =
      await response.text();


    console.log(
      "Apps Script response:",
      text
    );


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

  }

}