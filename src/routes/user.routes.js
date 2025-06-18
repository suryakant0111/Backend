import { Router } from "express";
import { registerUser, loginUser, loggedOutUser } from "../controllers/user.controller.js";
import { upload } from "../middelwears/multer.middelwear.js";
import { verifyJwt } from "../middelwears/auth.middelwear.js";

const router =  Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser);

router.route("/login").post(
    loginUser
    // loginUser
);
router.route("/logout").post(verifyJwt, loggedOutUser);
export default router;