import {v2 as cloudinary} from "cloudinary";
import { response } from "express";
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    // console.log(localFilePath);
    try {
        if(!localFilePath) return null;

        //upload to cloudinary if localFilePath exists
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        
        console.log("file uploaded to cloudinary", response);

        fs.unlinkSync(localFilePath); //remove file from localFilePath after uploading to cloudinary
        return result
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return error
    }
}

export default uploadOnCloudinary