import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/Apiresponse.js";
import { asyncHandler1 } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


// creating method for genrating access token and refresh token for the user

const generateAccessAndRefreshTokens = async(userId)=>{
try {
  const user = await User.findById(userId);
const accessToken = user.generateAccessToken();
const refreshToken = user.generateRefreshToken();
    user.refreshToken = generateRefreshToken

    await user.save(validateBeforeSave = false );
    return { accessToken, refreshToken };
    
} catch (error) {
    
throw new ApiError(500, "Error while genearating and refreshing tokens");
}
}

const registerUser = asyncHandler1(async (req, res) => {

  // get user data from frontend
  // validate - not empty, valid email, password length, etc.
  // check if user already exists
  // check for Avatar
  // upload avatar to cloudinary and get url if exists
  // create user  object and save in database
  // remove hashed password from response
  // chech for user creation success
  // return response to frontend
  

    const { username, email, fullName, password } = req.body;
    console.log("email", email);

    if(
      [fullName, username, email, password].some(field => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
    })
  
    if (existedUser) {
        throw new ApiError(408, "Username or email already exists");
    }

const avatarLocalPath = req.files?.avatar[0]?.path

// const coverImageLocalPath = req.files?.coverImage[0]?.path
// if(!avatarLocalPath){
//   throw new ApiError(400, "Avatar is required");
// }
let coverImageLocalPath;
if (
  req.files &&
  Array.isArray(req.files.coverImage) &&
  req.files.coverImage.length > 0
) {
  coverImageLocalPath = req.files.coverImage[0].path;
}

const avatar = await uploadOnCloudinary(avatarLocalPath);
if(!avatar){
  throw new ApiError(400, "Failed to upload avatar");
}
// const coverImage = await uploadOnCloudinary(coverImageLocalPath);

let coverImage = null;
if (coverImageLocalPath) {
  coverImage = await uploadOnCloudinary(coverImageLocalPath);
}
const user = await User.create({
  fullName,
  avatar: avatar.url,
  coverImage: coverImage ? coverImage.url : null,
  email,
  password,
  username: username.toLowerCase()

})

const createdUser = await User.findById(user._id).select("-password -refreshToken");

if (!createdUser) {
  throw new ApiError(500, "User creation failed");
}

res.status(200).json(
  new ApiResponse(
    200,
    "User created successfully",
    createdUser
  )
)



})

const loginUser = asyncHandler1(async (req, res) => {

 //user inputs
 //email or username
 //find user by email or username
 //check password
 //refresh token and access token
 //send response

 const{username,email,password}=req.body

 if(!username || !email){
    throw new ApiError(400, "Username and email are required");
 }

 const user =await User.findOne({
  $or:[ { username }, { email }]
 })

if(!user){
    throw new ApiError(404, "User not found");    
}

const isPasswordCorrect = await user.isPasswordCorrect(password).then((isMatch) => {
    if (!isMatch) {
        throw new ApiError(401, "Invalid password");
    }
})

const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
               
const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options = {
  httpOnly: true,
  secure: true // Set to true in production
}

return res
  .status(200)
  .cookie("refreshToken", refreshToken, options)
  .cookie("accessToken", accessToken, options)
  .json(new ApiResponse(200, "User logged in successfully", 
    {
    user: loggedInUser,accessToken,refreshToken
    },
    "User logged in successfully"
))
})

const loggedOutUser = asyncHandler1(async (req, res) => {
User.findByIdAndUpdate(
    req.user._id,
  {
    $set:{
       refreshToken: undefined
       }
  },
  {
    new: true,
  }

) 
options = {
  httpOnly: true,
  secure: true, // Set to true in production
}
return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, "User logged out successfully", null, "User logged out successfully"));
});


export { registerUser, loginUser, loggedOutUser, generateAccessAndRefreshTokens };