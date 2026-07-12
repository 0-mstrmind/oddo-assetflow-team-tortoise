import { Resend } from 'resend';
import { config } from '../../core/config/env.config.js';
import logger from '../../core/config/logger.config.js';

let resend;
if (config.resendApiKey) {
  resend = new Resend(config.resendApiKey);
}

export const sendVerificationEmail = async (toEmail, token) => {
  if (!resend) {
    logger.warn('RESEND_API_KEY is not configured. Skipping verification email.');
    // In dev mode, we can just print the token
    logger.info(`Verification link: ${config.allowedOrigins[0]}/verify-email?token=${token}`);
    return;
  }

  const verificationUrl = `${config.allowedOrigins[0]}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: 'AssetFlow <onboarding@resend.dev>', // Resend testing domain
      to: toEmail,
      subject: 'Verify your AssetFlow Admin Account',
      html: `
        <h2>Welcome to AssetFlow!</h2>
        <p>You have successfully initialized your workspace.</p>
        <p>Please verify your admin account by clicking the link below:</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;background:#D97736;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
        <br><br>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
    logger.info(`Verification email sent to ${toEmail}`);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
  }
};
