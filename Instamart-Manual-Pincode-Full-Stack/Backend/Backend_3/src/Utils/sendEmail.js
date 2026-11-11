
const nodemailer = require("nodemailer");

const sendEmail = async (subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: subject,
      text: message
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", result.messageId);

    return {
      success: true
    };

  } catch (error) {
    console.log("Email sending error:", error.message);

    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = sendEmail;
