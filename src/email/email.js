const mailgun = require("mailgun-js");
const DOMAIN = process.env.MAILGUN_DOMAIN;
const api_key = process.env.MAILGUN_API_KEY;
const mg = mailgun({apiKey: api_key, domain: DOMAIN});

const sendVerificationCode = (email, name, token) => {
    const data = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "Activation of Account",
        html: '<div>Hi ' + name + ',</div> <div>please click on this link for activation of your account: <a href="' + process.env.FRONT_END_URL +'/activate/'+ token +'">Activate</a></div>'
    };
    mg.messages().send(data, function (error, body) {
        console.log(body, error);
        if(error) {
            return
        }
    });
}

const sendResetPasswordEmail = (email, name, token) => {
    const data = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: "Reset Password",
        html: '<div>Hi ' + name + ',</div> <div>please go to this link for password reset: <a href="' + process.env.FRONT_END_URL +'/reset_password/'+ token + '">Reset Password</a></div>'
    };
    mg.messages().send(data, function (error, body) {
        console.log(body, error);
        if(error) {
            return
        }
    });
}

module.exports = { sendVerificationCode, sendResetPasswordEmail }