const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    if (file.mimetype.startsWith('image/')) {
      return {
        folder: 'images',
        resource_type: 'image',
      };
    } else if (file.mimetype === 'application/pdf') {
      return {
        folder: 'resumes',
        resource_type: 'raw',
      };
    } else {
      // Optional fallback for unsupported file types
      throw new Error('Unsupported file type');
    }
  },
});

module.exports = { cloudinary, storage };
