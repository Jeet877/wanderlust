// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_API_SECRET
// });



// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'wanderlust_DEV',
//     allowedFormats: ["png", "jpg", "jpeg"],
//   },
// });



// module.exports = {
//   cloudinary,
//   storage
// };


// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET
// });

// // ✅ Universal Storage (handles both images and videos)
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     let resourceType = "image"; // default

//     // agar video upload ho rahi hai to resource_type change kar do
//     if (file.mimetype.startsWith("video")) {
//       resourceType = "video";
//     }

//     return {
//       folder: "wanderlust_DEV",
//       resource_type: resourceType,
//       allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "avi"],
//     };
//   },
// });

// module.exports = {
//   cloudinary,
//   storage
// };









// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });

// // ✅ Storage handles both images & videos
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     let resourceType = "image";
//     if (file.mimetype.startsWith("video")) {
//       resourceType = "video";
//     }

//     return {
//       folder: "wanderlust_DEV",
//       resource_type: resourceType,
//       allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "avi"],
//     };
//   },
// });

// module.exports = { cloudinary, storage };









// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// // 🔹 1. Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // 👉 .env me define kar
//   api_key: process.env.CLOUDINARY_KEY,
//   api_secret: process.env.CLOUDINARY_SECRET,
// });

// // 🔹 2. Storage Configuration (handles both images & videos)
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     return {
//       folder: "wanderlust_DEV", // your folder name in Cloudinary
//       resource_type: "auto", // 👉 this allows both images & videos
//       allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "avi"],
//     };
//   },
// });

// // 🔥 --- NEW CODE BELOW (Only for avatar uploads) ----

// const multer = require("multer");

// const avatarStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "userAvatars", // Avatar will go here
//     allowed_formats: ["jpg", "jpeg", "png"],
//   },
// });

// const uploadAvatar = multer({ storage: avatarStorage });


// module.exports = {
//   cloudinary,
//   storage,uploadAvatar,
// };






















































const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// 🔹 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // matches .env
  api_key: process.env.CLOUDINARY_API_KEY,        // corrected
  api_secret: process.env.CLOUDINARY_API_SECRET,  // corrected
});

// Optional: Check if environment variables loaded correctly
console.log("Cloudinary Config Loaded:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing");

// 🔹 2. General Storage Configuration (for images & videos)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "wanderlust_DEV",       // folder name in Cloudinary
    resource_type: "auto",          // supports both images & videos
    allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "avi","avif","webp "],
  }),
});

// 🔹 3. Avatar Storage (for profile images)
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "userAvatars",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

// Multer uploaders
const upload = multer({ storage });            // general upload
const uploadAvatar = multer({ storage: avatarStorage });  // avatar upload

// 🔹 Export everything
module.exports = {
  cloudinary,
  storage,
  upload,
  uploadAvatar,
};  