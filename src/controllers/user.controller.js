import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/Apiresponse.js";
import { asyncHandler1 } from "../utils/asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

// creating method for genrating access token and refresh token for the user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    console.log("🔍 Received userId:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ No user found for ID:", userId);
      throw new ApiError(404, "User not found while generating tokens");
    }

    console.log("✅ Found user:", user.username);

    const accessToken = user.generateAccessToken();
    console.log("✅ Access token generated");

    const refreshToken = user.generateRefreshToken();
    console.log("✅ Refresh token generated");

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    console.log("✅ User saved with refresh token");

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("🔥 Error in token generation:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

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

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(408, "Username or email already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

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
  if (!avatar) {
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
    username: username?.toLowerCase() || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User created successfully", createdUser));
});

const loginUser = asyncHandler1(async (req, res) => {
  //user inputs
  //email or username
  //find user by email or username
  //check password
  //refresh token and access token
  //send response

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username and email are required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user
    .isPasswordCorrect(password)
    .then((isMatch) => {
      if (!isMatch) {
        throw new ApiError(401, "Invalid password");
      }
    });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true, // Set to true in production
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        "User logged in successfully",
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
///

const loggedOutUser = asyncHandler1(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true, // Set to true in production
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        "User logged out successfully",
        null,
        "User logged out successfully"
      )
    );
});

const refreshAccessToken = asyncHandler1(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized, refresh token is required");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(403, "Forbidden, invalid refresh token");
    }
    const options = {
      httpOnly: true,
      secure: true, // Set to true in production
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          "Access token refreshed successfully",
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    console.error("🔥 Error in refreshAccessToken:", error);
    throw new ApiError(
      500,
      "Something went wrong while refreshing access token"
    );
  }
});

const changePassword = asyncHandler1(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old password");
  }
  user.password = newPassword;
  user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Password changed successfully",
        null,
        "Password changed successfully"
      )
    );
});

const getCurrentUser = asyncHandler1(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Current user fetched successfully",
        user,
        "Current user fetched successfully"
      )
    );
});

const updateAccountDetails = asyncHandler1(async (req, res) => {
  const { fullName, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .select("-password -refreshToken")
    .then((updatedUser) => {
      if (!updatedUser) {
        throw new ApiError(404, "User not found");
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Account details updated successfully",
            updatedUser
          )
        );
    })
    .catch((error) => {
      console.error("🔥 Error in updateAccountDetails:", error);
      throw new ApiError(
        500,
        "Something went wrong while updating account details"
      );
    });
});

const updateUserAvatar = asyncHandler1(async (req, res) => {
  const avatarPath = req.file?.path;

  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarPath);
  if (!avatar.url) {
    throw new ApiError(400, "Failed to upload avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully", user));
});

const updateUserCoverImage = asyncHandler1(async (req, res) => {
  const coverImagePath = req.file?.path;

  if (!coverImagePath) {
    throw new ApiError(400, "Avatar is required");
  }
  const coverImage = await uploadOnCloudinary(coverImagePath);
  if (!coverImage.url) {
    throw new ApiError(400, "Failed to upload cover image");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Cover image updated successfully", user));
});

const getUserChannelProfile = asyncHandler1(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          if: { $in: [req.user?._id, "$subscribers.subscriber"] },
          then: true,
          else: false,
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "Channel not doeb s not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "channel deatails fetched successfully")
    );
});

const getWatchHistory = asyncHandler1(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",

        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  loggedOutUser,
  generateAccessAndRefreshTokens,
  refreshAccessToken,
  updateAccountDetails,
  changePassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelDetails,
  getWatchHistory,
  getUserChannelProfile,
};
