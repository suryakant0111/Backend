import { asyncHandler1 } from "../utils/asynchandler.js";


const registerUser = asyncHandler1(async (req, res) => {

    // Your registration logic here
    res.status(200).json(
        { message: "User registered successfully", success: true });

})


export { registerUser };