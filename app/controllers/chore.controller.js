import adaptRequest from "../helpers/adaptRequest";
import { makeHttpError } from "../helpers/httpHelper";
import Helper from "../helpers/helper";
import User from "../models/src/user.model";
import Chore from "../models/src/chore.model";
import Reviews from "../models/src/user.reviews";
import dbUpdate from "../helpers/db-updates";
import { Request, Response, NextFunction } from "express";

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export default class ChoreController {
  /**
   * @name createNewChore
   * @description This function creates a new chore with the given data.
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   *
   * @return {Object} chore  - The chore object
   *
   * @example
   *
   * createNewChore(req, res)
   */

  static async createNewChore(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    const data = Helper.requestBody(body);
    try {
      const chore = await new Chore(data).save();
      chore.populate("creator");
      return res.status(201).send({ chore: chore });
    } catch (e) {
      return res.status(400).send(
        makeHttpError({
          statusCode: 400,
          error: e,
        })
      );
    }
  }
  /**
   * @name getChores
   * @description This method will fetch all the chores assigned to the user based on the category.
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} user
   */

  static async getChores(req, res) {
    try {
      const user = req.user;
      if (req.params.id) {
        await Chore.find({
          $and: [{ creator: user._id }, { category: req.params.category }],
        })
          .populate("creator")
          .populate("applicants.applicantId")
          .exec(async (error, user) => {
            return res.status(200).send({ user: user });
          });
      }
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }
  /**
   * @name getAllChores
   * @description Returns all chores within a given category
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   *
   * @returns {Object} - Chores within the given category
   *
   * @async
   * @function
   */
  static async getAllChores(req, res) {
    try {
      const user = req.user;
      await Chore.find({ $and: [{ category: req.params.category }] })
        .populate("creator")
        .populate("applicants.applicantId")
        .exec(async (error, user) => {
          return res.status(200).send({ user: user });
        });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }

  /**
   * @name getReviews
   * @summary This method allows a chore owner to get all their reviews
   * @route {GET} /reviews/:id
   * @param {string} req.params.id - The item id
   * @returns {Object} reviewer - The reviews of the item
   */

  static async getReviews(req, res) {
    try {
      await Reviews.find({ reviewed: req.params.id })
        .populate("reviewer")
        .exec(async (error, reviewer) => {
          return res.status(200).send({ reviewer: reviewer });
        });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }
  /**
   * @name applyChore
   * @description This method allows a user to apply for a specific chore.
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} - The chore object, user object and token
   */
  static async applyChore(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    const user = req.user;
    try {
      await Chore.findOne({ _id: req.params.id })
        .populate("creator")
        .exec(async (error, chore) => {
          if (
            chore.applicants.filter(
              (e) => e.applicantId.toString() === user._id.toString()
            ).length > 0
          ) {
          } else {
            const id = { choreId: chore._id };
            chore.applicants.push(body);
            user.chores.push(id);
            user.save();
            const updatedUser = await User.findOne({ _id: user._id }).populate(
              "chores.choreId"
            );
            chore.save();
            return res.status(200).send({
              chore: chore,
              user: updatedUser,
              token: user.tokens[0].token,
            });
          }
        });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }
  /**
   * @method getAllChores
   * @description Retrieves all chores with the specified category
   * @param {Object} req - request object
   * @param {Object} res - response object
   * @returns {Object} - response object with the fetched chores
   */
  static async getAllChores(req, res) {
    try {
      const user = req.user;
      await Chore.find({ $and: [{ category: req.params.category }] })
        .populate("creator")
        .populate("applicants.applicantId")
        .exec(async (error, user) => {
          return res.status(200).send({ user: user });
        });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }
  /**
   * @summary Accepts an applicant for a chore
   * @description This method finds a chore specified by the id passed in the request object,
   * sets the acceptedApplicant property of the chore object to true and updates the choreApplicants
   * array of the chore object to set the choreAccepted property of the applicant to true. It also
   * sends a message to the applicant using dbUpdate.createMessage and updates the user using
   * dbUpdate.updateUser, then saves the chore with the updates.
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} The chore object with the updates
   *
   */
  static async acceptApplicant(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    const user = req.user;
    try {
      await Chore.findOne({ _id: req.params.id })
        .populate("creator")
        .exec(async (error, chore) => {
          chore.applicants.map((item) => {
            if (item.applicantId.toString() == body.applicantId.toString()) {
              item.choreAccepted = true;
            }
          });
          chore.acceptedApplicant = true;
          await dbUpdate.createMessage(
            user._id,
            body.applicantId,
            `${user.firstName} ${user.lastName}`,
            chore.title
          );
          await dbUpdate.updateUser(body.applicantId, req.params.id);
          chore.save();
          return res.status(200).send({ chore: chore });
        });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }

  /**
   *  @name searchChores
   *  @description Searches for chores based on a given query
   *  @param {Object} req - The request object
   *  @param {Object} res - The response object
   *  @return {Object} - Results of the search query
   */

  static async searchChores(req, res) {
    const regex = new RegExp(escapeRegex(req.params.query), "gi");
    try {
      Chore.find({ title: regex })
        .populate("creator")
        .exec((err, chore) => {
          if (err) return res.status(500).json({ message: err.message });
          return res.status(200).json({ chore });
        });
    } catch (error) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }

  /**
   * @description This method is used to update a chore's status, reviews, completed time, total hours and pay rate.
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   *
   * @return {Object} A JSON object containing the chore, user, and token
   */

  static async choreStatus(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    Chore.findOne({ _id: req.params.choreId }).exec(async (err, chore) => {
      if (err) return res.status(500).json({ message: err.message });
      const status = { status: true };
      chore.choreStarted = status;
      const user = await dbUpdate.updateChoreStatus(
        req.params.choreista,
        req.params.choreId,
        body.status
      );
      if (body.reviews) {
        await Reviews(body.reviews).save();
        console.log("body.reviews", body.reviews);
        const newStatus = { status: true, message: body.status };
        chore.choreStarted = newStatus;
        chore.completedTime = body.completedTime;
        chore.totalHours = body.totalHours;
        chore.payRate = body.payRate;
      }
      chore.save();
      return res
        .status(200)
        .json({ chore: chore, user: user, token: user.tokens[0].token });
    });
  }
  /**
   * @name deleteChore
   * @description Deletes a chore from the database.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} An object with a success key.
   */
  static async deleteChore(req, res) {
    try {
      const user = req.user;
      const deletedChore = await Chore.deleteOne({ _id: req.params.id });
      return res.send({ success: true });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }

  /**
   * @name updateChore
   * @description Updates an existing chore
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   *
   * @returns {Object} An object containing the success status and the updated chore
   */

  static async updateChore(req, res) {
    const httpRequest = adaptRequest(req);
    const { body, file } = httpRequest;
    const updates = Object.keys(body);
    const allowedUpdates = [
      "title",
      "category",
      "Date",
      "description",
      "startTime",
      "endTime",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(404).send(makeHttpError({ error: "Invalid updates" }));
    }

    try {
      const updateData = Helper.requestBody(body);

      const chore = await Chore.findOne({ _id: req.params.choreId });
      updates.forEach((update) => (chore[update] = updateData[update]));
      chore.save();
      return res.send({ success: true, chore: chore });
    } catch (e) {
      return res.status(400).send(
        makeHttpError({
          statusCode: 400,
          error: e,
        })
      );
    }
  }
}
