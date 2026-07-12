import { Resend } from 'resend';
import { config } from '../../core/config/env.config.js';
import logger from '../../core/config/logger.config.js';

let resend;
if (config.resendApiKey) {
  resend = new Resend(config.resendApiKey);
}

export const sendVerificationEmail = async (toEmail, token, extraData = {}) => {
  const { password, role, companyName } = extraData;
  const verificationUrl = `${config.allowedOrigins[0]}/verify-email?token=${token}`;

  let subject = 'Verify your AssetFlow Account';
  let html = `
    <h2>Welcome to AssetFlow!</h2>
    <p>Please verify your account by clicking the link below:</p>
    <a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;background:#D97736;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
    <br><br>
  `;

  if (password) {
    subject = 'Your AssetFlow Account Credentials & Verification';
    html += `
      <h3>Your Login Credentials:</h3>
      <p><strong>Email:</strong> ${toEmail}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
      <p><strong>Assigned Role:</strong> ${role || 'Employee'}</p>
      <p><em>Please make sure to verify your email first using the button above, otherwise you won't be able to log in. We recommend changing your password after your first login.</em></p>
    `;
  } else {
    html += `
      <p>If you did not request this, please ignore this email.</p>
    `;
  }

  if (!resend) {
    logger.warn('RESEND_API_KEY is not configured. Skipping actual email dispatch.');
    logger.info(`Verification link: ${verificationUrl}`);
    if (password) {
      logger.info(`Generated Credentials - Email: ${toEmail}, Password: ${password}`);
    }
    return;
  }

  try {
    await resend.emails.send({
      from: config.emailFrom,
      to: toEmail,
      subject,
      html,
    });
    logger.info(`Verification email sent to ${toEmail}`);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
  }
};
