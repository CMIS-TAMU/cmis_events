import nodemailer from "nodemailer";

const host = process.env.BREVO_SMTP_HOST;
const port = Number(process.env.BREVO_SMTP_PORT || 587);
const user = process.env.BREVO_SMTP_USER;
const pass = process.env.BREVO_SMTP_KEY;

if (!host || !user || !pass) {
  console.warn("[Brevo] SMTP environment variables are missing");
  console.warn(`[Brevo] Host: ${host ? 'SET' : 'MISSING'}, User: ${user ? 'SET' : 'MISSING'}, Pass: ${pass ? 'SET' : 'MISSING'}`);
} else {
  console.log(`[Brevo] SMTP configured: ${host}:${port}, User: ${user.substring(0, 10)}...`);
}

// Configure transporter with explicit TLS settings
export const brevoTransporter = nodemailer.createTransport({
  host,
  port,
  secure: false, // Use TLS (not SSL)
  requireTLS: true, // Require TLS
  auth: {
    user,
    pass,
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false,
  },
  // Add connection timeout
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export async function sendBrevoEmail(options: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
}) {
  const fromEmail = options.fromEmail || process.env.BREVO_FROM_EMAIL;
  const fromName = options.fromName || process.env.BREVO_FROM_NAME || "CMIS Events";

  if (!fromEmail) {
    throw new Error("BREVO_FROM_EMAIL is not set");
  }

  // Verify SMTP credentials are set
  if (!user || !pass) {
    throw new Error("BREVO_SMTP_USER or BREVO_SMTP_KEY is not set");
  }

  const toList = Array.isArray(options.to) ? options.to.join(",") : options.to;

  console.log(`[Brevo] Attempting to send email to: ${toList}`);
  console.log(`[Brevo] From: ${fromName} <${fromEmail}>`);
  console.log(`[Brevo] Using SMTP user: ${user.substring(0, 10)}...`);

  try {
    // Verify connection first
    await brevoTransporter.verify();
    console.log("[Brevo] SMTP connection verified successfully");

    const info = await brevoTransporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: toList,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("[Brevo] Message sent successfully", info.messageId);
    return info;
  } catch (error: any) {
    console.error("[Brevo] Error details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      message: error.message,
    });
    
    // Provide more helpful error messages
    if (error.code === 'EAUTH') {
      throw new Error(
        `Brevo SMTP Authentication failed. Please verify:\n` +
        `1. BREVO_SMTP_USER is correct (should be your SMTP login email)\n` +
        `2. BREVO_SMTP_KEY is correct (should be your SMTP key, not API key)\n` +
        `3. BREVO_FROM_EMAIL matches a verified email in your Brevo account\n` +
        `4. The FROM email should match or be related to the SMTP user\n` +
        `Original error: ${error.response || error.message}`
      );
    }
    
    throw error;
  }
}

