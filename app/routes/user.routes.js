import userController from "../controllers/user.controller";
import authController from "../controllers/auth.controller";
import uploadFile from "../helpers/fileUpload";
import upload from "../helpers/multer";
import authGuard from "../middleware/auth";

/** Express router providing user related routes
 * @module routers
 * @requires express
 */

const express = require("express");
const router = express.Router();

/**
 * @api {user} /api/v1/user/login Login user
 * @apiVersion 1.0.0
 * @apiName /user/login
 * @apiParam (Request body) {json Object} username and password of the user
 * @apiSuccess (Success 200) {json Object} user
 * @apiSuccess (Success 200) {String} token token of the user
 */
router.post("/user/login", authController.login);
/**
 * @api {user} /api/v1x/user/signup Register user
 * @apiVersion 1.0.0
 * @apiName /user/signup
 * @apiParam (Request body) {json Object} username, email , password of the user
 * @apiSuccess (Success 200) {json Object} user
 * @apiSuccess (Success 200) {String} token token of the user
 */
router.post("/user/signup", authController.createNewUser);

/**
 * @api {user} /user/confirm Confirm user
 * @apiVersion 1.0.0
 * @apiName /user/confirm
 * @apiParam (Request body) {json Object} user registration code sent to the email of the user
 * @apiSuccess (Success 200) {json Object} user
 * @apiSuccess (Success 200) {String} "Success"
 * @ApiError (Error 500) {json Object} error  error message
 */
router.post("/user/confirm", authGuard, authController.confirmUser);
/**
 * @api {user} /user/email Verify user email
 * @apiVersion 1.0.0
 * @apiName /user/email
 * @apiParam (Request body) {json Object} user email to be verified
 * @apiSuccess (Success 200) {json Object} user details
 * @apiSuccess (Success 200) {String} "Success"
 * @ApiError (Error 500) {json Object} error  error message
 */
router.post("/user/email", authController.confirmEmail);
/**
 * @api {user} /user/resend-code resend registration code
 * @apiVersion 1.0.0
 * @apiName /user/resend-code
 * @apiParam (Request Header) {String} token token of the user
 * @apiSuccess (Success 200) {json Object} user details
 * @apiSuccess (Success 200) {String} "Success"
 * @ApiError (Error 500) {json Object} error  error message
 */
router.post("/user/resend-code", authGuard, authController.resendCode);
/**
 * @api {user} /user/logout logout user
 * @apiVersion 1.0.0
 * @apiName /user/logout
 * @apiParam (Request Header) {String} token token of the user
 * @apiSuccess (Success 200) {String} "Success"
 * @ApiError (Error 500) {json Object} error  error message
 */

router.post("/user/logout", authGuard, authController.logout);
/**
 * @api {user} /user/reviews create a review
 * @apiVersion 1.0.0
 * @apiName create reviews
 * @apiParam (Request Body) {Json Object} object containing the review
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} review created
 * @ApiError (Error 500) {json Object} error  error message
 */

router.post("/user/reviews", authGuard, userController.createUserReviews);
/**
 * @api {user} /user/logoutall logout all user sessions
 * @apiVersion 1.0.0
 * @apiName /user/logoutall
 * @apiParam (Request Header) {String} token token of the user
 * @apiSuccess (Success 200) {String} "Success"
 * @ApiError (Error 500) {json Object} error  error message
 */
router.post("/user/logoutall", authGuard, authController.logoutAll);
/**
 * @api {user} /user/profile get user profile
 * @apiVersion 1.0.0
 * @apiName /user/profile
 * @apiParam (Request Header) {String} token token of the user
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} user profile
 * @ApiError (Error 500) {json Object} error  error message
 */

router.get("/user/profile", authGuard, userController.getUser);

/**
 * @api {user} /user/delete/:userType delete user
 * @apiVersion 1.0.0
 * @apiName /user/delete/:userType
 * @apiParam (Request Header) {String} token token of the user
 * @apiParam (Request params) {String} userType type of user to be deleted, choreowner or choriesta
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} user profile
 * @ApiError (Error 500) {json Object} error  error message
 */
router.delete(
  "/user/delete/:userType",
  authGuard,
  userController.deleteUserAccount
);

/**
 * @api {user} /user/messages/ get-messages get user messages
 * @apiVersion 1.0.0
 * @apiName /user/messages/get-messages
 * @apiParam (Request Header) {String} token token of the user
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} user messages
 * @ApiError (Error 500) {json Object} error  error message
 */
router.get(
  "/user/messages/get-messages",
  authGuard,
  userController.getMessages
);
/**
 * @api {user} /user/profile/ update user profile
 * @apiVersion 1.0.0
 * @apiName /user/profile
 * @apiParam (Request Body) {Json Object} user profile with data to be updated
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} user profile
 * @ApiError (Error 500) {json Object} error  error message
 */
router.patch("/user/profile", authGuard, userController.updateUser);

export default router;
