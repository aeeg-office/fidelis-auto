import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  // Always log for testing
  console.log(`[VERIFICATION] Email: ${email} | Code: ${code}`);

  // If SMTP is configured, send real email
  if (process.env.SMTP_HOST) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@fidelisauto.com",
        to: email,
        subject: "Verify your Fidelis Auto account",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Welcome to Fidelis Auto</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; 
                 text-align: center; padding: 20px; background: #f5f3ef; 
                 border-radius: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p>Enter this code on the verification page to activate your account.</p>
            <p style="color: #888; font-size: 12px;">Code expires in 10 minutes.</p>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.error("Email send failed:", err);
      return false;
    }
  }
  // SMTP not configured — code is in server logs
  return true;
}