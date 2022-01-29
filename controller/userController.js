const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const Post = require("../model/Post");
// const Use/ r = require("../models/userModel");

const s3 = new aws.S3({


  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,


});

const upload = (bucketName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `image-${Date.now()}.jpeg`);
      },
    }),
  });

exports.postPic = (req, res, next) => {
  const uploadSingle = upload("smile-app").single(
    "croppedImage"
  );

  uploadSingle(req, res, async (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });
 
    await Post.create({ photoUrl: req.file.location });

    res.status(200).json({ data: req.file.location });
  });
};
