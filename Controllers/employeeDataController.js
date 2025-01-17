import EmployeeSchema from "../Models/employeeSchema.js";
import Leave from "../Models/LeaveModel.js";
import Performance from "../Models/PerformanceModel.js";
import User from "../Models/user_model.js";
import Team from "../Models/TeamModel.js";

import cloudinary from "cloudinary";
import { hash } from "bcrypt";
import { sendEmail } from "../utils/sendEmail.js";
import user from "../Models/user_model.js";
import { ErrorHandler } from "../utils/errorHendler.js";
// import { AutoSendEmail } from "../utils/automatedEmail.js";

// import https from "https";
// import request from "request";

// import path from "path";
// import fs from "fs";
// import PDFNet from "@pdftron/pdfnet-node";
// import { fileURLToPath } from "url";
import base64StringToFile from "../utils/getFileFromBase64.js";


export const getAllEmployee = async (req, res) => {
  try {
    const employee = await EmployeeSchema.find({});
    res.status(200).json({ success: true, Data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id, employeeId } = req.params;

    let query = {};

    // Initial query using _id or employeeId
    if (id) {
      query._id = id;
    } else if (employeeId) {
      query.employeeId = employeeId;
    }

    let employee = await EmployeeSchema.findOne(query);

    // Fallback query using userId if no employee is found and id exists
    if (!employee && id) {
      query = { userId: id }; // New query for fallback
      employee = await EmployeeSchema.findOne(query);
    }

    // If still no employee found, return 404
    if (!employee) {
      return next(new ErrorHandler(404, "Employee not found"));
    }

    res.status(200).json({ Data: employee, success: true });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};


export const getEmployeeByUserId = async (req, res, next) => {
  try {

    const { _id } = req.user;

    const employee = await EmployeeSchema.findOne({ userId: _id });
    if (!employee) {
      return next(new ErrorHandler(404, "Employee not found"));
    }

    res.status(200).json({ Data: employee, success: true });
  } catch (error) {
    next(new ErrorHandler(500, error.message));
  }
};

export const updateOneEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await EmployeeSchema.findById(id);

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    console.log(req.body)
    // console.log(id)

    let myCloud1 = "";
    let myCloud = "";
    let updatedData = req.body;

    if (req.body.aadhar) {
      myCloud1 = await cloudinary.v2.uploader.upload(req.body.aadhar, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });

      if (myCloud1) {
        updatedData = {
          ...updatedData,
          aadhar: {
            public_id: myCloud1.public_id,
            url: myCloud1.secure_url,
          },
        };
      }
    }

    if (req.body.avatar) {
      myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

      if (myCloud) {
        updatedData = {
          ...updatedData,
          avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
        }
      }
    }

    let myCloud2 = "";
    if (req.body.pan) {
      myCloud2 = await cloudinary.v2.uploader.upload(req.body.pan, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });

      if (myCloud2) {
        updatedData = {
          ...updatedData,
          pan: {
            public_id: myCloud2.public_id,
            url: myCloud2.secure_url,
          },
        };
      }
    }

    let myCloud3 = "";
    if (req.body.Bank) {
      myCloud3 = await cloudinary.v2.uploader.upload(req.body.Bank, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });

      if (myCloud3) {
        updatedData = {
          ...updatedData,
          Bank: {
            public_id: myCloud3.public_id,
            url: myCloud3.secure_url,
          }
        }
      }
    }

    let myCloud4 = "";
    if (req.body.PF) {
      myCloud4 = await cloudinary.v2.uploader.upload(req.body.PF, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });

      if (myCloud4) {
        updatedData = {
          ...updatedData,
          PF: {
            public_id: myCloud4.public_id,
            url: myCloud4.secure_url,
          }
        }
      }
    }

    let myCloud5 = "";
    if (req.body.xthMarksheet) {
      myCloud5 = await cloudinary.v2.uploader.upload(req.body.xthMarksheet, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });

      if (myCloud5) {
        updatedData = {
          ...updatedData,
          xthMarksheet: {
            public_id: myCloud5.public_id,
            url: myCloud5.secure_url,
          }
        }
      }
    }

    let myCloud6 = "";
    if (req.body.xiithMarksheet) {
      myCloud6 = await cloudinary.v2.uploader.upload(req.body.xiithMarksheet, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        format: "pdf", // Change format to PDF
        overwrite: true,
      });

      if (myCloud6) {
        updatedData = {
          ...updatedData,
          xiithMarksheet: {
            public_id: myCloud6.public_id,
            url: myCloud6.secure_url,
          }
        }
      }
    }

    let myCloud7 = "";
    if (req.body.graduationMarksheet) {
      myCloud7 = await cloudinary.v2.uploader.upload(
        req.body.graduationMarksheet,
        {
          resource_type: "auto",
          folder: "files",
          // width: 150,
          // crop: "scale",
          // format: "pdf", // Change format to PDF
          overwrite: true,
        }
      );

      if (myCloud7) {
        updatedData = {
          ...updatedData,
          graduationMarksheet: {
            public_id: myCloud7.public_id,
            url: myCloud7.secure_url,
          }
        }
      }
    }

    let myCloud8 = "";
    if (req.body.pgMarksheet) {
      myCloud8 = await cloudinary.v2.uploader.upload(req.body.pgMarksheet, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });

      if (myCloud8) {
        updatedData = {
          ...updatedData,
          pgMarksheet: {
            public_id: myCloud8.public_id,
            url: myCloud8.secure_url,
          }
        }
      }

    }


    console.log(updatedData);

    const employeeUpdated = await EmployeeSchema.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (employeeUpdated) {
      res.status(201).json({ success: true, data: employeeUpdated, message: `Employee ${employeeUpdated.employeeId}-${employeeUpdated.name} updated successfully` });
    }

  } catch (err) {
    console.log("Error in updateOneEmployee controller: ", err)
    res.status(500).json({ success: false, message: "Error in updateOneEmployee controller: " + err.message })
  }
}

export const deleteOneEmployee = async (req, res) => {
  try {

    const { id } = req.params;

    // we can delete leave of this employee here
    await Leave.findOneAndDelete({ id: id })

    //we can delete attendence of employee here    
    await Performance.findOneAndDelete({ employeeDocId: id })

    //we can delete employee team here
    const deleteResult = await Team.deleteOne({
      'PeojectLeader.Id': id,
    });

    if (deleteResult.deletedCount === 0) {
      // Remove the team member if the ID matches
      await Team.updateMany(
        { 'teamMembers.Id': id },
        { $pull: { teamMembers: { 'Id': id } } }
      );
    }
    //we can delete employee here
    const employee = await EmployeeSchema.findByIdAndDelete(id);

    // we can delete login credential of employee here
    await User.findOneAndDelete({ _id: employee?.userId })

    res.status(200).json({ success: true, message: 'employee deleted successfully...' })

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: true, message: error.message })
  }
}

export const createEmployeeDetails = async (req, res) => {
  try {

    // console.log('employeeDetails',req.body)
    // return res.status(200).json({success:true,message:'Data Saved Successfully'});
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
    console.log({ firstName, lastName, fatherName, motherName, address, phoneNo, email, description, designation, designationLevel, employeeId })

    if (!firstName || !lastName || !fatherName || !motherName || !address || !phoneNo || !email || !description || !designation || !designationLevel || !employeeId) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' })
    }

    const employeeEmailCheck = await EmployeeSchema.findOne({ email: email });
    if (employeeEmailCheck) return res.status(400).json({ success: false, message: 'Employee with this email already exists.' });

    const employeeIdCheck = await EmployeeSchema.findOne({ employeeId: employeeId });
    if (employeeIdCheck) return res.status(400).json({ success: false, message: 'Employee with this employeeId already exists.' });

    // return res.status(200).json({success:true,message:'Data Saved Successfully'});

    let myCloud1 = "";
    let myCloud = "";

    if (req.body.aadhar) {
      myCloud1 = await cloudinary.v2.uploader.upload(req.body.aadhar, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
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
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    let myCloud3 = "";
    if (req.body.Bank) {
      myCloud3 = await cloudinary.v2.uploader.upload(req.body.Bank, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    let myCloud4 = "";
    if (req.body.PF) {
      myCloud4 = await cloudinary.v2.uploader.upload(req.body.PF, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    let myCloud5 = "";
    if (req.body.xthMarksheet) {
      myCloud5 = await cloudinary.v2.uploader.upload(req.body.xthMarksheet, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    let myCloud6 = "";
    if (req.body.xiithMarksheet) {
      myCloud6 = await cloudinary.v2.uploader.upload(req.body.xiithMarksheet, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
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
          // width: 150,
          // crop: "scale",
          // format: "pdf", // Change format to PDF
          overwrite: true,
        }
      );
    }

    let myCloud8 = "";
    if (req.body.pgMarksheet) {
      myCloud8 = await cloudinary.v2.uploader.upload(req.body.pgMarksheet, {
        resource_type: "auto",
        folder: "files",
        // width: 150,
        // crop: "scale",
        // format: "pdf", // Change format to PDF
        overwrite: true,
      });
    }

    const hashedPassword = await hash("password", 10);

    const User = await user.create({
      email: email,
      username: employeeId,
      password: hashedPassword,
      role: "employee",
    });

    const employeeDetails = await EmployeeSchema.create({
      firstName,
      lastName,
      fatherName,
      motherName,
      address,
      phoneNo: Number(phoneNo),
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

    console.log("emp details: ", employeeDetails);

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
      console.log('test 14')
      const message = `
        Congratulations on joining the MNNLR team! 🎉  
        We are thrilled to have you on board and look forward to your valuable contributions.

        Here are your login credentials to get started:
        - Employee ID: ${employeeId}
        - Password: password

        Please use these credentials to log in to our system and update your password at your earliest convenience.

        If you did not request this email, please disregard it.

        Warm regards,  
        MNNLR Team
      `;

      console.log("mes:", message);

      console.log('test 15')
      await sendEmail(email, "Employee Id Generation", message);
      console.log('test 16')

      //       const message1 = `Dear ${firstName + " " + lastName},

      // I hope this email finds you well. I am writing to you on behalf of MNNLR, an innovative startup company.

      // We understand that an unpaid internship may not be feasible for everyone, but we believe the experience gained at MNNLR will be invaluable for your future career aspirations.

      // Thank you for considering this opportunity with MNNLR. We look forward to potentially welcoming you to our team and helping you achieve your professional goals.
      // `;

      //       AutoSendEmail(email, "Internship Opportunity at MNNLR", message1);
    }

    console.log('test 17')

    res.status(201).json({
      success: true,
      message: "Data Saved Successfully",
      employeeDetails,
    });
  } catch (error) {
    console.log('error123', error)
    res.status(500).json({ success: false, message: error.message });
  }
};
