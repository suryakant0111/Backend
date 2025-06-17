import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadOnCloudinary = async (localFilePath)=>{

    try {
        if(!localFilePath) {
            throw new Error("No file path provided for upload");
        }
        const response  = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto", // Automatically detect the resource type (image, video, etc.)
        })
        console.log("File uploaded successfully:", response.url);
        return response // Return the URL of the uploaded file
        
    } catch (error) {

        fs.unlinkSync(localFilePath); // Delete the local file if upload fails
        return null; // Return null if upload fails
    }
    }

    


    export { uploadOnCloudinary };