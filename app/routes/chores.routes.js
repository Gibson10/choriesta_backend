import choreController from "../controllers/chore.controller";
import auth from "../middleware/auth";
/** Express router providing user related routes
 * @module routers
 * @requires express
 */
const express = require("express");
const router = express.Router();
/**
 * @api {chores} /chore/create-chore create a chore
 * @apiVersion 1.0.0
 * @apiName /chores/create-chore
 * @apiParam (Request Body) {Json Object} object containing the chore details
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object} chore
 * @ApiError (Error 500) {json Object} error  error message
 */

router.post("/chores/create-chore", auth, choreController.createNewChore);

/**
 * @api {chore} /chores/apply-chore/:id apply for a chore
 * @apiVersion 1.0.0
 * @apiName /chores/apply-chore/:id
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
 * @apiName /chores/accept-applicant/:id
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
 * @api {chores} /chores/:id/:category get choreowner's chores by category(All chores owned by a choreowner,base on category)
 * @apiVersion 1.0.0
 * @apiName /chores/:id/:category
 * @apiParam (Request Header) {String}  token of the user
 * @apiParam (Request Header) {String} category  of the chore
 * @apiParam (Request Header) {String} id  of the chore
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json array} chores
 * @ApiError (Error 500) {json Object} error  error message
 */
router.get("/chores/:id/:category", auth, choreController.getChores);
/**
 * @api {chores} /chores/reviews/:id get reviews based on the id of the business that posted the chore
 * @apiVersion 1.0.0
 * @apiName /chores/reviews/:id
 * @apiParam (Request Header) {String}  token of the user
 * @apiParam (Request Header) {String} id  of the chore
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json array} chores
 * @ApiError (Error 500) {json Object} error  error message
 */
router.get("/chores/reviews/:id", auth, choreController.getReviews);
/**
 * @api {chores} /chores-search/:query get chores based on the search query
 * @apiVersion 1.0.0
 * @apiName /chores-search/:query
 * @apiParam (Request Header) {String}  token of the user
 * @apiParam (Request Header) {String} query representing a the name of a chore
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json array} chores
 * @ApiError (Error 500) {json Object} error  error message
 */
router.get("/chores-search/:query", auth, choreController.searchChores);
/**
 * @api {chores} /chores/:category get chores By category
 * @apiVersion 1.0.0
 * @apiName /chores/:category
 * @apiParam (Request Header) {String}  token of the user
 * @apiParam (Request Header) {String} category  of the chore
 * @apiParam (Request Header) {String} id  of the chore
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json array} chores
 * @ApiError (Error 500) {json Object} error  error message
 */
router.get("/chores/:category", auth, choreController.getAllChores);
/**
 * @api {chores} /chores/delete/:id delete a chore based on the id
 * @apiVersion 1.0.0
 * @apiName /chores/delete/:id
 * @apiParam (Request Header) {String} token token of the user
 * @apiParam (Request params) {String} id  of the chore to be deleted
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object}  deleted chore
 * @ApiError (Error 500) {json Object} error  error message
 */
router.delete("/chores/delete/:id", auth, choreController.deleteChore);
/**
 * @api {chores} /chores/update/:choreId update a chore based on the id
 * @apiVersion 1.0.0
 * @apiName /chores/update/:choreId
 * @apiParam (Request Header) {String} token token of the user
 * @apiParam (Request params) {String} id  of the chore to be updated
 * @apiParam (Request Body) {Json Object} object containing the chore details
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object}  updated chore
 * @ApiError (Error 500) {json Object} error  error message
 */

router.put("/chores/update/:choreId", auth, choreController.updateChore);
/**
 * @api {chores} /chore-status/:choreId/:choreista update a chore based on the id and the status of completion of the chore
 * @apiVersion 1.0.0
 * @apiName /chore-status/:choreId/:choreista
 * @apiParam (Request Header) {String} token token of the user
 * @apiParam (Request params) {String} id  of the chore to be updated
 * @apiParam (Request params) {String} status  of the chore to be updated
 * @apiSuccess (Success 200) {String} "Success"
 * @apiSuccess (Success 200) {json Object}  updated chore
 * @ApiError (Error 500) {json Object} error  error message
 */

router.post(
  "/chore-status/:choreId/:choreista",
  auth,
  choreController.choreStatus
);

export default router;
