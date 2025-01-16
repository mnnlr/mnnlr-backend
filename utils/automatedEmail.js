import nodeMailer from "nodemailer";
import schedule from "node-schedule";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AutoSendEmail = async (email, subject, message) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const pdfPath = path.join(__dirname, "../files/Offerletter-MNNLR.pdf");
  const pdfFile = fs.readFileSync(pdfPath);

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: subject,
    text: message,
    attachments: [
      {
        filename: "Offerletter-MNNLR.pdf",
        content: pdfFile,
        contentType: "application/pdf",
      },
    ],
  };

  let sendDate = new Date();
  sendDate.setSeconds(sendDate.getSeconds() + 10);
  let job = schedule.scheduleJob(sendDate, () => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
  console.log(`Email scheduled to be sent at: ${sendDate}`);
};
