import ApiError from "./ApiError.js";
import { StatusCodes } from "http-status-codes";

// Send email using Resend API (native fetch)
export const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not defined in environment variables. Email sending skipped.");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "AssetFlow <noreply@mstrmind.in>",
        to: [to],
        subject,
        html
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Resend API error response:", result);
      throw new ApiError(StatusCodes.BAD_REQUEST, result.message || "Failed to send email");
    }
    return result;
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw error;
  }
};
