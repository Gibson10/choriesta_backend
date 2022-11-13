import userController from "../controllers/user.controller";
import authController from "../controllers/auth.controller";
import uploadFile from "../helpers/fileUpload";
import upload from "../helpers/multer";
import authGuard from "../middleware/auth";

const express = require("express");
const router = express.Router();
router.post("/user/login", authController.login);
router.post("/user/signup", authController.createNewUser);
router.post("/user/confirm", authGuard, authController.confirmUser);
router.post("/user/email", authController.confirmEmail);
router.post("/user/resend-code", authGuard, authController.resendCode);
router.post("/user/logout", authGuard, authController.logout);
router.post("/user/reviews", authGuard, userController.createUserReviews);
router.post("/user/logoutall", authGuard, authController.logoutAll);
router.get("/user/profile", authGuard, userController.getUser);
router.delete(
  "/user/delete/:userType",
  authGuard,
  userController.deleteUserAccount
);
router.get(
  "/user/messages/get-messages",
  authGuard,
  userController.getMessages
);
router.patch("/user/profile", authGuard, userController.updateUser);
router.get("/user/profile", authGuard, userController.updateUser);

export default router;
