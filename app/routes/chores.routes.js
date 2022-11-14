import choreController from "../controllers/chore.controller";
import auth from "../middleware/auth";

const express = require("express");
const router = express.Router();
router.post("/chores/create-chore", auth, choreController.createNewChore);
router.post("/chores/apply-chore/:id", auth, choreController.applyChore);
router.post(
  "/chores/accept-applicant/:id",
  auth,
  choreController.acceptApplicant
);
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
