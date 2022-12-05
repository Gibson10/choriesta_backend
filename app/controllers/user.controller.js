import adaptRequest from "../helpers/adaptRequest";
import { makeHttpError } from "../helpers/httpHelper";
import fileUpload from "../helpers/fileUpload";
import User from "../models/src/user.model";
import Messages from "../models/src/messages.model";

import UserReviews from "../models/src/user.reviews";
import Helper from "../helpers/helper";
import { Request, Response, NextFunction } from "express";

export default class UserController {
  /**
   * @name getUser
   * @description Retrieves the user from the request object and returns them
   * @param {Object} req - The incoming request object
   * @param {Object} res - The outgoing response object
   * @returns {Object} - The response containing the user
   */
  static async getUser(req, res) {
    try {
      const user = req.user;
      return res.status(200).send({ user: user });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }

  /**
   * @name deleteUserAccount
   * @description Deletes a user account from the database, it first checks the type of user to delete and invokes the appropriate method
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} Response object with the deleted user
   */

  static async deleteUserAccount(req, res) {
    try {
      const userType = req.params.userType;
      if (userType === "choreowner") {
        await req.user.deleteChoreowner();
      } else {
        await req.user.deleteChoreista();
      }

      return res.status(200).send(req.user);
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issues",
        })
      );
    }
  }

  /**
   * @summary Updates user data in the system
   * @description This method updates the user data from the request body and file.
   * The request body should contain the keys of the fields to be updated and the file object should contain the file to be uploaded.
   * This method only allows updates to the fields specified in the allowedUpdates array.
   * If the request body contains any other keys, the server will respond with an Invalid updates error.
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} A response object containing the updated user data and token
   *
   * @example
   *
   *  updateUser(req, res)
   *  // returns { success: true, user: user, token: user.tokens[0].token }
   */
  static async updateUser(req, res) {
    const httpRequest = adaptRequest(req);
    const { body, file } = httpRequest;
    const dataPayload = Helper.requestBody(body);
    const updates = Object.keys(body);

    const allowedUpdates = [
      "firstName",
      "lastName",
      "password",
      "email",
      "phoneNumber",
      "chorePreferences",
      "dateOfBirth",
      "guardianInformation",
      "residentialAddress",
      "availability",
      "licenceNumber",
      "expirationDate",
      "emergencyContact",
      "notifications",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(404).send(makeHttpError({ error: "Invalid updates" }));
    }

    try {
      const updateData = Helper.requestBody(body);
      const user = await req.user;
      updates.forEach((update) => (user[update] = updateData[update]));
      if (file) {
        console.log(file, body.licenceNumber);
        const fileUrl = await fileUpload.upload(file.file, user._id);
        if (body.licenceNumber) {
          const Licence = {
            licenceNumber: body.licenceNumber,
            expirationDate: body.expirationDate,
            licenceImage: fileUrl.fileUrl,
          };
          user.drivingLicense = Licence;
        } else {
          user.profilePicture = fileUrl.fileUrl;
        }
      }

      user.save();
      return res.send({
        success: true,
        user: user,
        token: user.tokens[0].token,
      });
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
   * @name getMessages
   * @description Retrieves a list of messages from the database
   * @async
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} A response containing a list of messages
   */

  static async getMessages(req, res) {
    try {
      const user = req.user;
      const messages =
        user.role === "choreowner"
          ? await Messages.find({ sender: user._id }).populate("receiver")
          : await Messages.find({ receiver: user._id }).populate("sender");
      return res.status(200).send({ messages: messages });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }

  /**
   * @function createUserReviews
   * @description Creates user reviews
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @returns {Object} - the response object
   */

  static async createUserReviews(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    const dataPayload = Helper.requestBody(body);
    try {
      const review = await new UserReviews(dataPayload).save();
      return res.status(200).send({ review: review });
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
   * @name getUserReviews
   * @description Retrieves reviews for a given user
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   *
   * @returns {Object} - An object containing the user reviews
   */

  static async getUserReviews(req, res) {
    try {
      const user = req.user;
      const reviews = await UserReviews.find({ reviewed: user._id });
      return res.status(201).send({ review: reviews });
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
