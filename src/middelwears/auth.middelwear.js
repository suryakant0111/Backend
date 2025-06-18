import { User } from "../models/user.model.js";
import { asyncHandler1 } from "../utils/asynchandler.js"
import jwt from "jsonwebtoken"; 

const verifyJwt = asyncHandler1(async (req, res, next) => {

try {
    const token = req.cookies.accessToken || 
    req.headers("authorization")?.replace("Bearer ", "");
    
    if(!token) {
        return res.status(401).json({
            status: "fail",
            message: "Unauthorized access"
        });
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
       const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
       if(!user) {
           return res.status(404).json({
               status: "fail",
               message: "User not found"
           });
       }
       req.user = user;
       next();
} catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({
        status: "fail",
        message: "Unauthorized access"
    });
    
}
})
export { verifyJwt };