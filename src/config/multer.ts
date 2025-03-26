const multer = require("multer");
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
const multerS3 = require('multer-s3')

// Use memory storage to hold files in memory
const storage = multer.memoryStorage();
const s3 = new S3Client()


// Configure Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Limit file size to 10MB
});



// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_S3_BUCKET,
//     metadata: function (req: any, file: any, cb: any) {
//       cb(null, {fieldName: file.fieldname});
//     },
//     key: function (req: any, file: any, cb:any) {
//       cb(null, Date.now().toString())
//     }
//   })
// })

export default upload;