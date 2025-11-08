const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email with credentials
const sendWelcomeEmail = async (user, temporaryPassword) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .credentials { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 2px dashed #2563eb; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to OneFlow</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>Your account has been created successfully in the OneFlow Project Management System.</p>
          
          <div class="credentials">
            <h3>Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
            <p><strong>Role:</strong> ${user.role}</p>
          </div>

          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>

          <a href="${process.env.CLIENT_URL}/login" class="button">Login Now</a>

          <p>If you have any questions, please contact your administrator.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} OneFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Welcome to OneFlow - Your Account Credentials',
    html: html,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          <p>You have requested to reset your password for your OneFlow account.</p>
          
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
          </div>

          <p>Alternatively, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} OneFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'OneFlow - Password Reset Request',
    html: html,
  });
};

// Send notification email
const sendNotificationEmail = async (user, notification) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .notification { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>OneFlow Notification</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name},</h2>
          
          <div class="notification">
            <h3>${notification.title}</h3>
            <p>${notification.message}</p>
          </div>

          ${notification.link ? `<a href="${process.env.CLIENT_URL}${notification.link}" class="button">View Details</a>` : ''}

          <p>You can view all your notifications by logging into OneFlow.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} OneFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `OneFlow - ${notification.title}`,
    html: html,
  });
};

// Send user deletion notification email
const sendUserDeletionEmail = async (userEmail, userName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .warning { background-color: #fee2e2; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account Deleted</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName},</h2>
          
          <div class="warning">
            <h3>⚠️ Your Account Has Been Deleted</h3>
            <p>Your account in the OneFlow Project Management System has been permanently deleted by your administrator.</p>
          </div>

          <p><strong>What this means:</strong></p>
          <ul>
            <li>You can no longer access the OneFlow system</li>
            <li>All your data has been removed from the system</li>
            <li>This email address can now be used for a new account if needed</li>
          </ul>

          <p>If you believe this was done in error, please contact your system administrator.</p>

          <p>Thank you for using OneFlow.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} OneFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'OneFlow - Account Deleted',
    html: html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendUserDeletionEmail,
};

