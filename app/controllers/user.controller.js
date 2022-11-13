import adaptRequest from "../helpers/adaptRequest";
import { makeHttpError } from "../helpers/httpHelper";
import fileUpload from "../helpers/fileUpload";
import User from "../models/src/user.model";
import Messages from "../models/src/messages.model";

import UserReviews from "../models/src/user.reviews";
import Helper from "../helpers/helper";

export default class UserController {
  //get a user from the user token
  static async getUser(req, res) {
    try {
      const user = req.user;
      // const user = await User.findOne({ _id: req.params.id });
      return res.status(200).send({ user: user });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issue",
        })
      );
    }
  }

  //delete user account
  static async deleteUserAccount(req, res) {
    try {
      const userType = req.params.userType;
      if (userType === "choreowner") {
        await req.user.deleteChoreowner();
      } else {
        await req.user.deleteChoreista();
      }

      return res.status(201).send(req.user);
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "Internal issues",
        })
      );
    }
  }
  ///update user's account
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

  //get all messages
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

  //update user's reviews
  static async createUserReviews(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    const dataPayload = Helper.requestBody(body);
    try {
      const review = await new UserReviews(dataPayload).save();
      return res.status(201).send({ review: review });
    } catch (e) {
      return res.status(400).send(
        makeHttpError({
          statusCode: 400,
          error: e,
        })
      );
    }
  }

  //get user's reviews
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