// import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import Connection from "./DataBase/DataBaseConnection.js";
import cloudinary from "cloudinary";
import fileUpload from "express-fileupload";
import configDotenv from "dotenv";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import morgan from "morgan";
import fs from "fs";
import cron from "node-cron";
// import path from "path";
// import dashboardRoute from "./Router/statisticsRoute.js";

const app = express();

if (process.env.NODE_ENV !== "production") {
  configDotenv.config({
    path: "config/config.env",
  });
}

app.use(express.json());

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 5000,
  }),
);

import { autoUpdateLeave } from "./utils/autoUpdateLeave.js";
import { autoRemoveLeaves } from "./utils/autoRemoveLeaves.js";

// cron.schedule('*/10 * * * * *', () => {
//     autoUpdateLeave().then(() => console.log('Employee leaves update function running')).catch(err => console.error('Error updating employee leaves:', err));
// });
cron.schedule("0 0 * * *", () => {
  autoUpdateLeave()
    .then(() => console.log("Employee leaves update function running"))
    .catch((err) => console.error("Error updating employee leaves:", err));

  autoRemoveLeaves()
    .then(() => console.log("Employee leaves removal function is executed."))
    .catch((err) => console.log("Error while removing leaves: ", err));
});

app.use(bodyParser.json());

app.use(cookieParser("MY SECRET"));

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      process.env.CLIENT_URL1,
      process.env.ClIENT_URL_WORKSPACE_SERVER,
      process.env.CLIENT_URL,
    ],
    withCredentials: true,
    credentials: true,
  }),
);

app.use(morgan("tiny"));

import ContectusRouter from "./Router/ContectusRouter.js";

import clientRouter from "./Router/ClientRoute.js";
import orderRoutes from "./Router/orderRoute.js";
import pageRoutes from "./Router/pageRoute.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import portfolioRoute from "./Router/portfolioRoute.js";
import projectRoute from "./Router/projectRoute.js";
import client from "./Router/clientRouter.js";
import companyRouter from "./Router/companyRoute.js";
import dashboardRoute from "./Router/statisticsRoute.js";
import visitRoute from "./Router/visitorRoute.js";
import employeeRoute from "./Router/employeeDataRoute.js";
import userRoute from "./Router/userEmployeeRoute.js";
import userRouter from "./Router/user_routes.js";
import authenticateRouter from "./Router/AuthenticateRoute.js";
import PerformanceRoute from "./Router/PerformanceRoute.js";
import webDesignRouter from "./Router/webDesignRoutes.js";
import EmployeeRegistrationRoute from "./Router/employeeRegistraionRoute.js";
import New_CandidateRoute from "./Router/New_Candidate_Route.js";

import RefreshTokenRoute from "./Router/RefreshTokenRoute.js";
import LeaveRouter from "./Router/LeaveRoute.js";
import teamRouter from "./Router/TeamRoute.js";

import verifyEmpForWorkspaceRouter from "./Router/verifyEmpForWorkspaceRouter.js";
import PasswordRecoveryRoute from "./Router/passwordRecoveryRoute.js";

// router for updating user data
app.use(userRouter);

app.use(RefreshTokenRoute);
app.use(webDesignRouter);

app.use("/authenticate", authenticateRouter);
app.use("/api/v1", ContectusRouter);
app.use("/api/v1/recovery", PasswordRecoveryRoute);

app.use("/client", clientRouter);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/page", pageRoutes);
app.use("/api/v1", portfolioRoute);
app.use("/api/v1", projectRoute);
app.use("/api/v1", EmployeeRegistrationRoute);

app.use("/api/v1", client);
app.use("/api/v1", companyRouter);
app.use("/api/v1", dashboardRoute);
app.use("/api/v1", visitRoute);
app.use("/api/v1", employeeRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1/performance", PerformanceRoute);
app.use("/api/v1/newcandidate", New_CandidateRoute);

app.use("/leave", LeaveRouter);
app.use("/team", teamRouter);

// API for verifing wrokspace users during sign-up
app.use("/api/ms1/verifyEmpForWorkspace", verifyEmpForWorkspaceRouter);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post("/replace-text", async (req, res) => {
  try {
    // const { inputPath, outputPath, replacements } = req.body;

    const inputPath = "./files/Offerletter-MNNLR.pdf";
    const outputPath = `./files/Offerletter-MNNLR-${Date.now()}.pdf`;

    // Load the PDF
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Iterate over each page and draw the replacements
    const pages = pdfDoc.getPages();
    cl;
    for (const page of pages) {
      const { width, height } = page.getSize();
      const content = page.getTextContent();

      content.items.forEach((item) => {
        const { str, transform } = item;
        const x = transform[4];
        const y = height - transform[5];
        if (replacements[str]) {
          page.drawText(replacements[str], {
            x,
            y,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        }
      });
    }

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // Write the modified PDF to a file
    fs.writeFileSync(outputPath, pdfBytes);

    res.send({ message: "Text replacement completed successfully!" });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res
      .status(500)
      .send({ error: "An error occurred while processing the PDF" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorMiddleware);
const PORT = process.env.PORT || 5000;

Connection();

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
