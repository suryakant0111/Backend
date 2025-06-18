import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("No file path provided for upload");
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // ✅ Delete file only if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    // ❌ Try deleting file only if it exists
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (unlinkErr) {
        console.error("Failed to delete local file:", unlinkErr.message);
      }
    }

    return null;
  }
};

export { uploadOnCloudinary };
