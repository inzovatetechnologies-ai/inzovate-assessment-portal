const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

const TARGET_ADMIN_EMAILS = [
  'winoraproject@gmail.com',
  'admin@inzovate-technologies.com',
];

function createTransporter() {
  const user = (process.env.SMTP_USER || 'winoraproject@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'ieffskxuiqauuwpp').replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function sendPasswordResetEmail({ toEmail, candidateName, candidateId, resetOtp }) {
  const transporter = createTransporter();
  const subject = `Inzovate Verification OTP: ${resetOtp}`;
  const textContent = `INZOVATE TECHNOLOGIES PRIVATE LIMITED - Candidate Portal Verification\n\nDear ${candidateName || 'Candidate'},\n\nYour 6-digit OTP verification code is: ${resetOtp}\nCandidate ID: ${candidateId || 'N/A'}\nRegistered Email: ${toEmail}\n\nThis OTP is valid for 15 minutes. If you did not request this, please contact support@inzovate-technologies.com.\n\n© 2026 INZOVATE TECHNOLOGIES PRIVATE LIMITED (CIN: U62011TZ2025PTC036329)`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background: #F5F7FB; padding: 25px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="background: #0A1128; color: #ffffff; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 1.5px; color: #ffffff;">INZOVATE TECHNOLOGIES PRIVATE LIMITED</h2>
          <p style="margin: 6px 0 0; font-size: 12px; color: #38bdf8; font-weight: bold; letter-spacing: 1px;">TALENT ASSESSMENT RECRUITMENT PORTAL</p>
        </div>
        <div style="padding: 28px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <p style="margin-top: 0;">Dear <strong>${candidateName || 'Candidate'}</strong>,</p>
          <p>We received a password reset request for your candidate portal access.</p>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px; color: #475569;">
              <strong>Candidate ID:</strong> <span style="font-family: monospace; color: #0066FF; font-weight: bold;">${candidateId || 'Registered Candidate'}</span>
            </p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #475569;">
              <strong>Registered Email:</strong> ${toEmail}
            </p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background: #EFF6FF; border: 2px dashed #0066FF; color: #0066FF; font-size: 28px; font-weight: 800; letter-spacing: 8px; padding: 12px 28px; border-radius: 8px; font-family: monospace;">
              ${resetOtp}
            </span>
            <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Valid for 15 minutes. Do not share this OTP with anyone.</p>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            If you did not request this password reset, please contact our administrator immediately at 
            <a href="mailto:admin@inzovate-technologies.com" style="color: #0066FF;">admin@inzovate-technologies.com</a>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            © 2026 INZOVATE TECHNOLOGIES PRIVATE LIMITED (CIN: U62011TZ2025PTC036329). All rights reserved. Automated Security Notification.
          </p>
        </div>
      </div>
    </div>
  `;

  console.log(`\n====================================================`);
  console.log(`📧 PASSWORD RESET OTP DISPATCHED`);
  console.log(`FROM: winoraproject@gmail.com`);
  console.log(`TO (Candidate): ${toEmail}`);
  console.log(`Candidate Name: ${candidateName}`);
  console.log(`Candidate ID: ${candidateId}`);
  console.log(`OTP Code: ${resetOtp}`);
  console.log(`====================================================\n`);

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Inzovate Portal" <winoraproject@gmail.com>`,
        to: toEmail,
        replyTo: 'winoraproject@gmail.com',
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log('✅ Real SMTP Email dispatched directly to candidate:', toEmail, 'Response:', info.response, 'MessageId:', info.messageId);
      return { success: true, method: 'smtp', messageId: info.messageId, response: info.response };
    } catch (err) {
      console.warn('⚠️ SMTP send error:', err.message);
      return { success: true, method: 'logged', error: err.message };
    }
  } else {
    console.log('ℹ️ SMTP credentials not configured.');
    return { success: true, method: 'logged' };
  }
}

module.exports = {
  sendPasswordResetEmail,
  TARGET_ADMIN_EMAILS,
  TARGET_ADMIN_EMAIL: 'winoraproject@gmail.com',
};
