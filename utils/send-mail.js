const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
// generate JWT from payload before.
const sendRecoveryEmail = async (email, username, payload) => {
  let info = await transporter.sendMail({
    from: '"Generic Webstore" <webstore@noreply.com> ',
    to: email,
    subject: "Recover Webshop account",
    text: `Hello, ${username}! For resetting your password, click the following link: localhost:3000/recovery/${payload}`,
    html: `<h3>Hello, ${username}! For resetting your password, click <a href="http://localhost:3000/api/v1/auth/recovery/${payload}">here</a>.<h3>`,
  });
  console.log(info);
};

module.exports = sendRecoveryEmail;
