import choreController from "../controllers/chore.controller";
import auth from "../middleware/auth";
/** Express router providing user related routes
 * @module routers
 * @requires express
 */
const express = require("express");
const router = express.Router();
/**
 * @api {chore} /chore/create-chore create a chore
 * @apiVersion 1.0.0
 * @apiName create chore
 * @apiParam (Request Body) {Json Object} object containing the chore details
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} chore
 * @ApiError (Error 500) {json Object} error  error message
 */

router.post("/chores/create-chore", auth, choreController.createNewChore);

/**
 * @api {chore} /chores/apply-chore/:id apply for a chore
 * @apiVersion 1.0.0
 * @apiName apply chore
 * @apiParam (Request Header) {String} token token of the user
 * @apiParam (Request Header) {String} id  of the chore
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} chore
 * @ApiError (Error 500) {json Object} error  error message
 */
router.post("/chores/apply-chore/:id", auth, choreController.applyChore);
/**
 * @api {chore} /chores/accept-applicant/:id accept applicant for a chore
 * @apiVersion 1.0.0
 * @apiName accept applicant
 * @apiParam (Request Header) {String}  token of the user
 * @apiParam (Request Header) {String} id  of the chore
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} chore
 * @ApiError (Error 500) {json Object} error  error message
 */
router.post(
  "/chores/accept-applicant/:id",
  auth,
  choreController.acceptApplicant
);
/**
 * @api {chore} /chores/:id/:category get chores By category
 * @apiVersion 1.0.0
 * @apiName get chores by category
 * @apiParam (Request Header) {String}  token of the user
 * @apiParam (Request Header) {String} category  of the chore
 * @apiParam (Request Header) {String} id  of the chore
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json array} chores
 * @ApiError (Error 500) {json Object} error  error message
 */
router.get("/chores/:id/:category", auth, choreController.getChores);
router.get("/chore/reviews/:id", auth, choreController.getReviews);
router.get("/chores-search/:query", auth, choreController.searchChores);
router.get("/chores/:category", auth, choreController.getAllChores);
router.delete("/chores/delete/:id", auth, choreController.deleteChore);
router.put("/chores/update-chore/:choreId", auth, choreController.updateChore);
router.post(
  "/chore-status/:choreId/:choreista",
  auth,
  choreController.choreStatus
);

export default router;
