import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/Apiresponse.js";
import { asyncHandler1 } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


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

   const existedUser =  User.findOne({
      $or: [{ username }, { email }]
    })
  
    if (existedUser) {
        throw new ApiError(408, "Username or email already exists");
    }

const avatarLocalPath = req.files?.avatar[0]?.path

const coverImageLocalPath = req.files?.coverImage[0]?.path
if(!avatarLocalPath){
  throw new ApiError(400, "Avatar is required");
}

const avatar = await uploadOnCloudinary(avatarLocalPath);
if(!avatar){
  throw new ApiError(400, "Failed to upload avatar");
}
const coverImage = await uploadOnCloudinary(coverImageLocalPath);

const user = await User.create({
  fullName,
  avatar: avatar.url,
  coverImage: coverImage ? coverImage.url : null,
  email,
  password,
  username: username.toLowerCase()

})

const createdUser = user.select("-password -refreshToken")

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



export { registerUser };