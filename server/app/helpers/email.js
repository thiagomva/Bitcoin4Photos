const nodeMailer = require('nodemailer');

class Email {
    constructor() {
    }
    static SendEmail (to, subject, htmlMessage) {
        const transporter = nodeMailer.createTransport({
          host: 'pro.turbo-smtp.com',
          port: 465,
          secure: true, 
          auth: {
            user: 'ariny.guedes@auctus.org',
            pass: 'MA4CtKMU'
          }
        });
        const mailOptions = {
          from: '"Bitcoin4Photos" <noreply@bitcoin4photos.net>',
          to: to, 
          subject: subject, 
          html: htmlMessage 
        };
        return transporter.sendMail(mailOptions);
    };
}

module.exports = Email;