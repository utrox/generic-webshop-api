const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  // generate JWT from payload before.
});

const sendVerifyEmail = async (email, username, activationToken) => {
  console.log(email, activationToken);
  let info = await transporter.sendMail({
    from: '"Generic Webstore" <webstore@noreply.com> ',
    to: email,
    subject: "Recover Webshop account",
    text: `Hello, ${username}! Click the following link to verify your account:  http://localhost:3000/api/v1/auth/activate-account/${activationToken}`,
    html: `<h3>Hello, ${username}! Click <a href="http://localhost:3000/api/v1/auth/activate-account/${activationToken}">here</a> to verify your accont..<h3>`,
  });
  console.log(info);
};

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

module.exports = { sendVerifyEmail, sendRecoveryEmail };
