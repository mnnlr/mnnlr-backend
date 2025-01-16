import multer from 'multer';


export const multerUpload = multer({
    limits:{
        fileSize:1024*1024*50
    }
})

const singleImage = multerUpload.single("file");
const singleVideo = multerUpload.single("video");
const multipleImage = multerUpload.array("files",10);

export {singleImage,multipleImage,singleVideo};


// import multer from "multer";
// // Set up storage for uploaded files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// // Create the multer instance
// const upload = multer({ storage: storage });

// export default upload;