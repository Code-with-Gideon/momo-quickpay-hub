
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the data from the request
    const requestUrl = new URL(req.url);
    const data = await req.json();
    const authEvent = JSON.parse(data.record.type);

    // Check if this is an email change or confirmation
    if (authEvent.includes('EMAIL_CHANGE') || authEvent.includes('EMAIL_CONFIRMATION')) {
      // Override default Supabase email templates with custom branded templates
      return new Response(
        JSON.stringify({
          subject: "Verify your email for Momo Quickpay",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #070058; margin-bottom: 10px;">Momo Quickpay</h1>
                  <p style="font-size: 18px; color: #333333; font-weight: 500;">Verify Your Email Address</p>
              </div>
              
              <div style="margin-bottom: 25px; color: #555555; font-size: 16px; line-height: 1.5;">
                  <p>Thank you for registering with Momo Quickpay. Please verify your email address by clicking the button below:</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 25px;">
                  <a href="${data.user.confirmation_url}" style="display: inline-block; background-color: #070058; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Verify Email</a>
              </div>
              
              <div style="margin-bottom: 20px; color: #555555; font-size: 14px;">
                  <p>Or copy and paste this URL into your browser:</p>
                  <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">${data.user.confirmation_url}</p>
              </div>
              
              <div style="color: #888888; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                  <p>If you did not create an account with Momo Quickpay, please ignore this email.</p>
                  <p>© ${new Date().getFullYear()} Momo Quickpay. All rights reserved.</p>
              </div>
          </div>
          `,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if this is a password reset
    if (authEvent.includes('RECOVERY')) {
      // Override default Supabase password recovery email template
      return new Response(
        JSON.stringify({
          subject: "Reset your password for Momo Quickpay",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #070058; margin-bottom: 10px;">Momo Quickpay</h1>
                  <p style="font-size: 18px; color: #333333; font-weight: 500;">Reset Your Password</p>
              </div>
              
              <div style="margin-bottom: 25px; color: #555555; font-size: 16px; line-height: 1.5;">
                  <p>We received a request to reset your password. Click the button below to set a new password:</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 25px;">
                  <a href="${data.user.confirmation_url}" style="display: inline-block; background-color: #070058; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
              </div>
              
              <div style="margin-bottom: 20px; color: #555555; font-size: 14px;">
                  <p>Or copy and paste this URL into your browser:</p>
                  <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">${data.user.confirmation_url}</p>
              </div>
              
              <div style="color: #888888; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                  <p>If you did not request a password reset, please ignore this email or contact support.</p>
                  <p>© ${new Date().getFullYear()} Momo Quickpay. All rights reserved.</p>
              </div>
          </div>
          `,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return default response for other events
    return new Response(
      JSON.stringify({ message: "Not a supported auth event" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in custom-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
};

serve(handler);
