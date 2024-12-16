const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
  auth: {
    user: process.env.EMAIL_ID, // Your personal email
    pass: process.env.EMAIL_PASSWORD, // App password for Gmail
  },
  });








  async function sendVerificationEmail(user, token) {
    const mailOptions = {
      from: 'process.env.EMAIL_ID',
      to: user.email,
      subject: 'Twitch Stars - Verification',
      html: `
        <h1>Hi ${user.name},</h1>
        <br>
        <h3>Click the link below to verify your email address:</h3>
        <br>
        <a href="https://twitchstars.onrender.com/verifyemail?token=${token}">Verify Email</a>
        <br>
        <h3>The confirmation link will expire in 1 Hour.</h3>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent to:', user.email);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
  
  module.exports = { sendVerificationEmail };