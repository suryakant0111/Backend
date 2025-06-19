import { timeStamp } from "console";
import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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
      
        coverImage:{
            type:String,// URL to the avatar image using Cloudinary or any other service        
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
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
,{timestamps   : true});



//with this we can store the encrypted password in the database
userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

//this compares the password entered by the user with the encrypted password stored in the database
userSchema.methods.isPasswordCorrect = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
// generate access token and refresh token for the user


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);