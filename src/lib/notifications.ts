const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// Twilio (SMS / Voice / WhatsApp)
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || "";

function getTwilioClient() {
  if (!twilioAccountSid || !twilioAuthToken) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tw = require("twilio");
  return tw(twilioAccountSid, twilioAuthToken);
}

// ─── EMAIL ────────────────────────────────────

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  console.log(`[VERIFICATION] Email: ${email} | Code: ${code}`);

  if (!RESEND_API_KEY) {
    console.log("[VERIFICATION] No RESEND_API_KEY — code in logs only.");
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Fidelis Auto <onboarding@resend.dev>",
        to: email,
        subject: "Verify your Fidelis Auto account",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="font-family: Georgia, serif;">Welcome to Fidelis Auto</h2>
            <p>Your verification code is:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:6px;text-align:center;padding:24px;background:#f5f3ef;border-radius:8px;margin:24px 0;color:#1a1a2e;">
              ${code}
            </div>
            <p>Enter this code at <a href="https://fidelisauto.com/verify?email=${encodeURIComponent(email)}">fidelisauto.com/verify</a></p>
            <p style="color:#888;font-size:12px;">Code expires in 10 minutes.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    if (res.ok) { console.log(`[EMAIL SENT] ${email} | ID: ${data.id}`); return true; }
    else { console.error(`[EMAIL FAILED] ${email}:`, data); return false; }
  } catch (err) { console.error(`[EMAIL ERROR] ${email}:`, err); return false; }
}

// ─── SMS ──────────────────────────────────────

export async function sendSmsCode(phone: string, code: string): Promise<boolean> {
  console.log(`[SMS VERIFICATION] Phone: ${phone} | Code: ${code}`);
  const client = getTwilioClient();
  if (!client) { console.log("[SMS] Twilio not configured — code in logs only."); return true; }

  try {
    const msg = await client.messages.create({
      body: `Your Fidelis Auto verification code is: ${code}. Valid for 10 minutes.`,
      from: twilioPhone,
      to: phone,
    });
    console.log(`[SMS SENT] ${phone} | SID: ${msg.sid}`);
    return true;
  } catch (err) { console.error(`[SMS ERROR] ${phone}:`, err); return false; }
}

// ─── VOICE CALL ───────────────────────────────

export async function callWithCode(phone: string, code: string): Promise<boolean> {
  console.log(`[VOICE VERIFICATION] Phone: ${phone} | Code: ${code}`);
  const client = getTwilioClient();
  if (!client) { console.log("[VOICE] Twilio not configured — code in logs only."); return true; }

  try {
    const call = await client.calls.create({
      twiml: `<Response><Say voice="alice">Your Fidelis Auto verification code is: ${code.split("").join(", ")}. Repeat: ${code.split("").join(", ")}.</Say></Response>`,
      to: phone,
      from: twilioPhone,
    });
    console.log(`[VOICE CALLED] ${phone} | SID: ${call.sid}`);
    return true;
  } catch (err) { console.error(`[VOICE ERROR] ${phone}:`, err); return false; }
}

// ─── WHATSAPP ─────────────────────────────────

export async function sendWhatsAppCode(phone: string, code: string): Promise<boolean> {
  console.log(`[WHATSAPP VERIFICATION] Phone: ${phone} | Code: ${code}`);
  const client = getTwilioClient();
  if (!client) { console.log("[WHATSAPP] Twilio not configured — code in logs only."); return true; }

  try {
    const msg = await client.messages.create({
      body: `Your Fidelis Auto verification code is: ${code}. Valid for 10 minutes.`,
      from: `whatsapp:${twilioPhone}`,
      to: `whatsapp:${phone}`,
    });
    console.log(`[WHATSAPP SENT] ${phone} | SID: ${msg.sid}`);
    return true;
  } catch (err) { console.error(`[WHATSAPP ERROR] ${phone}:`, err); return false; }
}