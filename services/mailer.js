require("dotenv").config();
const nodemailer = require("nodemailer");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function mailSender(sendMailTo,userWhoAddedBook,bookName) {
    return new Promise((resolve, reject) => {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "dzonnna@gmail.com",
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: "dzonnna@gmail.com",
            to: sendMailTo,
            subject: "New book added: "+bookName,
            text: userWhoAddedBook+" added new book. In attachment you have CSV file about book information",
            attachments: {
                filename: bookName+".csv",
                path: __dirname + "/csv/" + bookName+".csv",
            }
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Error in sending email: "+err);
                resolve(false);
            }
            else {
                console.log("Email sent! " + info.response);
                resolve(true);
            }
        });
    });
}

module.exports = mailSender;