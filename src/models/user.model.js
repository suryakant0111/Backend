import { timeStamp } from "console";
import mongoose, {Schema} from "mongoose";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { expires } from "mongoose/lib/utils";

const userSchema = Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
         email:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
            
        },
         fullName:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar:{
            type:String,// URL to the avatar image using Cloudinary or any other service
            required:true,
        
        },
        avatar:{
            type:String,// URL to the avatar image using Cloudinary or any other service
            required:true,
        
        },
        coverImage:{
            type:String,// URL to the avatar image using Cloudinary or any other service        
        },
        watchHistory:[
            {
                type:Schema.types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken:{
            type: String,
        },

}
,{timestamp: true});



//with this we can store the encrypted password in the database
userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

//this compares the password entered by the user with the encrypted password stored in the database
userSchema.method.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.method.generateAccessToken = function() {
  return  jwt.sign(
    {
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN 
  }
)
}

userSchema.method.generateRefreshToken = function() {
  return  jwt.sign(
    {
        _id: this._id,
     
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN 
    }
)
}

export const User = mongoose.model("User", userSchema);