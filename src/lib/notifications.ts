const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// Redact a phone number for logs (keeps the last 2 digits + country hint, never the full number).
function redactPhone(phone: string): string {
  if (!phone) return "(none)";
  const p = phone.replace(/[^\d+]/g, "");
  if (p.length < 4) return "***";
  return `${p.slice(0, 3)}***${p.slice(-2)}`;
}

// Sanitize a provider error message/object for logs: mask any phone number substrings and collapse
// the object to a short safe string (provider errors can embed the destructured phone).
function sanitizeProviderError(err: unknown): string {
  let s = "";
  if (err instanceof Error) s = err.message;
  else if (typeof err === "string") s = err;
  else if (err && typeof err === "object") {
    try { s = JSON.stringify(err); } catch { s = String(err); }
    // Fall back to a generic message if the object has no useful detail.
    if (s.length > 300) s = s.slice(0, 300);
  }
  // Mask any on-screen phone-like number, including grouped forms like "+20 100 123 4567".
  // First collapse spaces/dashes/plus.grouping into a run of digits, then mask contiguous 8-15
  // digit runs that likely form an E.164 number.
  s = s
    .replace(/(\+?\d[\d\s\-().]{7,}\d)/g, (m) => `${m[0]}***${m[m.length - 1]}`)
    .replace(/\+?\d{8,15}/g, (m) => (m.length >= 6 ? `${m.slice(0, 3)}***${m.slice(-2)}` : m));
  return s || "unknown provider error";
}

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
  console.log(`[VERIFICATION] Email: ${email} | Code: [REDACTED]`);

  if (!RESEND_API_KEY) {
    console.log("[VERIFICATION] No RESEND_API_KEY — channel disabled (code not logged for security).");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FIDELIS_EMAIL_FROM || "Fidelis Auto <no-reply@fidelis-auto.com>",
        ...(process.env.FIDELIS_REPLY_TO
          ? { replyTo: process.env.FIDELIS_REPLY_TO }
          : {}),
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
  console.log(`[SMS VERIFICATION] Phone: ${redactPhone(phone)} | Code: [REDACTED]`);
  const client = getTwilioClient();
  if (!client) { console.log("[SMS] Twilio not configured — channel disabled (code not logged for security)."); return false; }

  try {
    const msg = await client.messages.create({
      body: `Your Fidelis Auto verification code is: ${code}. Valid for 10 minutes.`,
      from: twilioPhone,
      to: phone,
    });
    console.log(`[SMS SENT] ${redactPhone(phone)} | SID: ${msg.sid}`);
    return true;
  } catch (err) { console.error(`[SMS ERROR] ${redactPhone(phone)}:`, sanitizeProviderError(err)); return false; }
}

// ─── VOICE CALL ───────────────────────────────

export async function callWithCode(phone: string, code: string): Promise<boolean> {
  console.log(`[VOICE VERIFICATION] Phone: ${redactPhone(phone)} | Code: [REDACTED]`);
  const client = getTwilioClient();
  if (!client) { console.log("[VOICE] Twilio not configured — channel disabled (code not logged for security)."); return false; }

  try {
    const call = await client.calls.create({
      twiml: `<Response><Say voice="alice">Your Fidelis Auto verification code is: ${code.split("").join(", ")}. Repeat: ${code.split("").join(", ")}.</Say></Response>`,
      to: phone,
      from: twilioPhone,
    });
    console.log(`[VOICE CALLED] ${redactPhone(phone)} | SID: ${call.sid}`);
    return true;
  } catch (err) { console.error(`[VOICE ERROR] ${redactPhone(phone)}:`, sanitizeProviderError(err)); return false; }
}

// ─── WHATSAPP ─────────────────────────────────

export async function sendWhatsAppCode(phone: string, code: string): Promise<boolean> {
  console.log(`[WHATSAPP VERIFICATION] Phone: ${redactPhone(phone)} | Code: [REDACTED]`);
  const client = getTwilioClient();
  if (!client) { console.log("[WHATSAPP] Twilio not configured — channel disabled (code not logged for security)."); return false; }

  try {
    const msg = await client.messages.create({
      body: `Your Fidelis Auto verification code is: ${code}. Valid for 10 minutes.`,
      from: `whatsapp:${twilioPhone}`,
      to: `whatsapp:${phone}`,
    });
    console.log(`[WHATSAPP SENT] ${redactPhone(phone)} | SID: ${msg.sid}`);
    return true;
  } catch (err) { console.error(`[WHATSAPP ERROR] ${redactPhone(phone)}:`, sanitizeProviderError(err)); return false; }
}