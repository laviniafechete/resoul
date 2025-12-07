const nodemailer = require("nodemailer");

const mailSender = async (email, title, body, options = {}) => {
  console.log(options, "aici options");
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 465,
      secure:
        process.env.MAIL_SECURE !== undefined
          ? process.env.MAIL_SECURE === "true"
          : true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from:
        options.from ||
        process.env.MAIL_FROM ||
        "ReSoul Platform <no-reply@resoul.ro>",
      to: email,
      replyTo: options.userEmail,
      subject: title,
      html: body,
    });

    return info;
  } catch (error) {
    console.log("Error while sending mail (mailSender) - ", email, error);
    throw error;
  }
};

module.exports = mailSender;
