const nodemailer = require('nodemailer');
const MailTemplate = require('../../utils/EmailTemplateHTML');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  sendEmail(targetEmail, username, otp) {
    const message = {
      from: 'MyChat',
      to: targetEmail,
      subject: 'Verify your email adrress',
      text: 'Successfully send email',
      html: MailTemplate(username, otp),
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
