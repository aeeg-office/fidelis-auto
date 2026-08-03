const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  console.log(`[VERIFICATION] Email: ${email} | Code: ${code}`);

  if (!RESEND_API_KEY) {
    console.log("[VERIFICATION] No RESEND_API_KEY configured — code only visible in logs.");
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fidelis Auto <onboarding@resend.dev>",
        to: email,
        subject: "Verify your Fidelis Auto account",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="font-family: Georgia, serif;">Welcome to Fidelis Auto</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 6px; 
                 text-align: center; padding: 24px; background: #f5f3ef; 
                 border-radius: 8px; margin: 24px 0; color: #1a1a2e;">
              ${code}
            </div>
            <p>Enter this code at <a href="https://fidelisauto.com/verify?email=${encodeURIComponent(email)}">fidelisauto.com/verify</a> to activate your account.</p>
            <p style="color: #888; font-size: 12px;">Code expires in 10 minutes.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[EMAIL SENT] ${email} | Resend ID: ${data.id}`);
      return true;
    } else {
      console.error(`[EMAIL FAILED] ${email}: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (err) {
    console.error(`[EMAIL ERROR] ${email}:`, err);
    return false;
  }
}