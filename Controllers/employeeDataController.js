import EmployeeSchema from "../Models/employeeSchema.js";
import cloudinary from "cloudinary";
import { hash } from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import user from "../Models/user_model.js";
import { ErrorHandler } from "../utils/errorHendler.js";
import { AutoSendEmail } from "../utils/automatedEmail.js";

import https from "https";
import request from "request";

import path from "path";
import fs from "fs";
import PDFNet from "@pdftron/pdfnet-node";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllEmployee = async (req, res) => {
  try {
    const employee = await EmployeeSchema.find({});
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id, employeeId } = req.params;

    let query = {};
    if (id) {
      query = { _id: id };
    }

    if (employeeId) {
      query = { employeeId: employeeId };
    }

    const employee = await EmployeeSchema.findOne(query);
    if (!employee) {
      return next(new ErrorHandler(404, "Employee not found"));
    }

    res.status(200).json({ employee, success: true });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const createEmployeeDetails = async (req, res) => {
  try {
    let myCloud1 = "";
    let myCloud = "";

    if (req.body.aadhar) {
      myCloud1 = await cloudinary.v2.uploader.upload(req.body.aadhar, {
        resource_type: "auto",
        folder: "files",
        width: 150,
        crop: "scale",
        format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }
    if (req.body.avatar) {
      myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
    }
    let myCloud2 = "";
    if (req.body.pan) {
      myCloud2 = await cloudinary.v2.uploader.upload(req.body.pan, {
        resource_type: "auto",
        folder: "files",
        width: 150,
        crop: "scale",
        format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }
    let myCloud3 = "";
    if (req.body.Bank) {
      myCloud3 = await cloudinary.v2.uploader.upload(req.body.Bank, {
        resource_type: "auto",
        folder: "files",
        width: 150,
        crop: "scale",
        format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    let myCloud4 = "";
    if (req.body.PF) {
      myCloud4 = await cloudinary.v2.uploader.upload(req.body.PF, {
        resource_type: "auto",
        folder: "files",
        width: 150,
        crop: "scale",
        format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    let myCloud5 = "";
    if (req.body.xthMarksheet) {
      myCloud5 = await cloudinary.v2.uploader.upload(req.body.xthMarksheet, {
        resource_type: "auto",
        folder: "files",
        width: 150,
        crop: "scale",
        format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    let myCloud6 = "";
    if (req.body.xiithMarksheet) {
      myCloud6 = await cloudinary.v2.uploader.upload(req.body.xiithMarksheet, {
        resource_type: "auto",
        folder: "files",
        width: 150,
        crop: "scale",
        format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    let myCloud7 = "";
    if (req.body.graduationMarksheet) {
      myCloud7 = await cloudinary.v2.uploader.upload(
        req.body.graduationMarksheet,
        {
          resource_type: "auto",
          folder: "files",
          width: 150,
          crop: "scale",
          format: "pdf", // Change format to PDF
          overwrite: true,
        }
      );
    }

    let myCloud8 = "";
    if (req.body.pgMarksheet) {
      myCloud8 = await cloudinary.v2.uploader.upload(req.body.pgMarksheet, {
        resource_type: "auto",
        folder: "files",
        width: 150,
        crop: "scale",
        format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    const {
      firstName,
      lastName,
      fatherName,
      motherName,
      address,
      phoneNo,
      email,
      description,
      designation,
      designationLevel,
      employeeId,
    } = req.body;
console.log('req body : ',req.body);
    const hashedPassword = await hash("password", 10);

    const User = await user.create({
      username: employeeId,
      password: hashedPassword,
      role: "employee",
    });

    console.log('User : ',User)

    const employeeDetails = await EmployeeSchema.create({
      firstName,
      lastName,
      fatherName,
      motherName,
      address,
      phoneNo,
      email,
      description,
      designation,
      designationLevel,
      employeeId,
      userId: User._id,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      aadhar: {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      },
      pan: {
        public_id: myCloud2.public_id,
        url: myCloud2.secure_url,
      },
      Bank: {
        public_id: myCloud3.public_id,
        url: myCloud3.secure_url,
      },
      PF: {
        public_id: myCloud4.public_id,
        url: myCloud4.secure_url,
      },
      xthMarksheet: {
        public_id: myCloud5.public_id,
        url: myCloud5.secure_url,
      },
      xiithMarksheet: {
        public_id: myCloud6.public_id,
        url: myCloud6.secure_url,
      },
      graduationMarksheet: {
        public_id: myCloud7.public_id,
        url: myCloud7.secure_url,
      },
      pgMarksheet: {
        public_id: myCloud8.public_id,
        url: myCloud8.secure_url,
      },
    });

    //Logic for sending employeeid , Offer Letter and Generating Pdf
    if (employeeDetails._id) {
      // --------------------------------------------------------------------------------------------------->
      //logic for replacing text in pdf
      // const API_KEY = "kashifrazasonbarsa@gmail.com_5p6br1Owwr22S0k53eeM9h9gPb8n8y062hc1V0mpPOt0tFj8oR851ZeHMEHBBnQd";

      // Source PDF file
      // const SourceFile = "../files/Offerletter-MNNLR.pdf";
      // PDF document password. Leave empty for unprotected documents.
      // const Password = "";
      // Destination PDF file name
      // const DestinationFile = `./files/OfferLetter-${Date.now()}.pdf`;

      // function addMonths(date, months) {
      //   const d = new Date(date);
      //   d.setMonth(d.getMonth() + months);
      //   return d;
      // }

      // Calculate the new dates
      // const createdAtDate = new Date(employeeDetails.createdAt);
      // const newDate1 = createdAtDate.toLocaleDateString();
      // const newDate2 = addMonths(createdAtDate, 6).toLocaleDateString();

      // const searchReplacePairs = [
      //   {
      //     searchString: "Md Kashif Raza",
      //     replaceString: firstName + " " + lastName,
      //   },
      //   {
      //     searchString: "08-05-2024",
      //     replaceString: newDate1,
      //   },
      //   {
      //     searchString: "08-11-2024",
      //     replaceString: newDate2,
      //   },
      //   {
      //     searchString: "Faridabad Haryana",
      //     replaceString: address,
      //   },
      //   {
      //     searchString: "Faridabad, Haryana, 121004",
      //     replaceString: "",
      //   },
      //   // Add more pairs as needed
      // ];

      // 1. RETRIEVE PRESIGNED URL TO UPLOAD FILE.
      // getPresignedUrl(API_KEY, SourceFile)
      //   .then(([uploadUrl, uploadedFileUrl]) => {
      //     // 2. UPLOAD THE FILE TO CLOUD.
      //     uploadFile(API_KEY, SourceFile, uploadUrl)
      //       .then(() => {
      //         // 3. Replace Text FROM UPLOADED PDF FILE
      //         for (const pair of searchReplacePairs) {
      //           replaceStringFromPdf(
      //             API_KEY,
      //             uploadedFileUrl,
      //             Password,
      //             DestinationFile,
      //             pair.searchString,
      //             pair.replaceString
      //           );
      //         }
      //       })
      //       .catch((e) => {
      //         console.log(e);
      //       });
      //   })
      //   .catch((e) => {
      //     console.log(e);
      //   });

      // function getPresignedUrl(apiKey, localFile) {
      //   return new Promise((resolve) => {
      //     // Prepare request to `Get Presigned URL` API endpoint
      //     let queryPath = `/v1/file/upload/get-presigned-url?contenttype=application/octet-stream&name=${path.basename(
      //       SourceFile
      //     )}`;
      //     let reqOptions = {
      //       host: "api.pdf.co",
      //       path: encodeURI(queryPath),
      //       headers: { "x-api-key": API_KEY },
      //     };
      //     // Send request
      //     https
      //       .get(reqOptions, (response) => {
      //         response.on("data", (d) => {
      //           let data = JSON.parse(d);
      //           if (data.error == false) {
      //             // Return presigned url we received
      //             resolve([data.presignedUrl, data.url]);
      //           } else {
      //             // Service reported error
      //             console.log("getPresignedUrl(): " + data.message);
      //           }
      //         });
      //       })
      //       .on("error", (e) => {
      //         // Request error
      //         console.log("getPresignedUrl(): " + e);
      //       });
      //   });
      // }

      // function uploadFile(apiKey, localFile, uploadUrl) {
      //   return new Promise((resolve) => {
      //     fs.readFile(SourceFile, (err, data) => {
      //       request(
      //         {
      //           method: "PUT",
      //           url: uploadUrl,
      //           body: data,
      //           headers: {
      //             "Content-Type": "application/octet-stream",
      //           },
      //         },
      //         (err, res, body) => {
      //           if (!err) {
      //             resolve();
      //           } else {
      //             console.log("uploadFile() request error: " + e);
      //           }
      //         }
      //       );
      //     });
      //   });
      // }

      // function replaceStringFromPdf(
      //   apiKey,
      //   uploadedFileUrl,
      //   password,
      //   destinationFile,
      //   searchString,
      //   replaceString
      // ) {
      //   // Prepare request to `Replace Text from PDF` API endpoint
      //   var queryPath = `/v1/pdf/edit/replace-text`;

      //   // JSON payload for api request
      //   var jsonPayload = JSON.stringify({
      //     name: path.basename(destinationFile),
      //     password: password,
      //     url: uploadedFileUrl,
      //     searchString: searchString,
      //     replaceString: replaceString,
      //   });

      //   var reqOptions = {
      //     host: "api.pdf.co",
      //     method: "POST",
      //     path: queryPath,
      //     headers: {
      //       "x-api-key": apiKey,
      //       "Content-Type": "application/json",
      //       "Content-Length": Buffer.byteLength(jsonPayload, "utf8"),
      //     },
      //   };
      //   // Send request
      //   var postRequest = https
      //     .request(reqOptions, (response) => {
      //       response.on("data", (d) => {
      //         response.setEncoding("utf8");
      //         // Parse JSON response
      //         let data = JSON.parse(d);
      //         if (data.error == false) {
      //           // Download PDF file
      //           var file = fs.createWriteStream(destinationFile);
      //           https.get(data.url, (response2) => {
      //             response2.pipe(file).on("close", () => {
      //               console.log(
      //                 `Generated PDF file saved as "${destinationFile}" file.`
      //               );
      //             });
      //           });
      //         } else {
      //           // Service reported error
      //           console.log("readBarcodes(): " + data.message);
      //         }
      //       });
      //     })
      //     .on("error", (e) => {
      //       // Request error
      //       console.log("readBarcodes(): " + e);
      //     });

      //   // Write request data
      //   postRequest.write(jsonPayload);
      //   postRequest.end();
      // }

      // ------------------------------------------------------------------------------------------>

      const message = `\n Your temporary Username and Password are :- ${employeeId} and ${"password"}' \n\n 
    If you have not requested this email then, please ignore it `;

      const status = await sendEmail(email, "Employee Id Generation", message);
      console.log('status : ',status);
//       const message1 = `Dear ${firstName + " " + lastName},

// I hope this email finds you well. I am writing to you on behalf of MNNLR, an innovative startup company.

// We understand that an unpaid internship may not be feasible for everyone, but we believe the experience gained at MNNLR will be invaluable for your future career aspirations.

// Thank you for considering this opportunity with MNNLR. We look forward to potentially welcoming you to our team and helping you achieve your professional goals.
// `;

//       AutoSendEmail(email, "Internship Opportunity at MNNLR", message1);
    }



    res.status(201).json({
      success: true,
      message: "Data Saved Successfully",
      employeeDetails,
    });
  } catch (error) {
    console.log('error', error)
    res.status(500).json({ success: false, message: error.message });
  }
};
