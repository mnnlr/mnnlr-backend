import fs from "fs";
import { PdfReader } from "pdfreader";

export const readPdffile = async () => {
  const pdfPath = "./files/Offerletter-MNNLR.pdf";

  if (!fs.existsSync(pdfPath)) {
    console.error("PDF file not found:", pdfPath);
    return;
  }

  // Read the PDF file
  fs.readFile(pdfPath, (err, pdfBuffer) => {
    if (err) {
      console.error("Error reading the PDF file:", err);
      return;
    }

    // Parse the PDF buffer
    new PdfReader().parseBuffer(pdfBuffer, function (err, item) {
      if (err) {
        console.error("Error parsing the PDF file:", err);
      } else if (!item) {
        console.log("End of file");
      } else if (item.text) {
        console.log(item.text);
      }
    });
  });
};
