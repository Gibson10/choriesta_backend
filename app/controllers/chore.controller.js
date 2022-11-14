import adaptRequest from "../helpers/adaptRequest";
import { makeHttpError } from "../helpers/httpHelper";
import Helper from "../helpers/helper";
import User from "../models/src/user.model";
import Chore from "../models/src/chore.model";
import Reviews from "../models/src/user.reviews";
import dbUpdate from "../helpers/db-updates";

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export default class ChoreController {
  // create  a new chore
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

  //get choreowner chores by id
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

  //get chores from every choreowner
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

  //get reviews
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

  // allows applicants to submit their application
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

  //get chores by creator
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

  //accept applicants who apply for a chore
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

  //search specific chores
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

  // updates the chore status when the choreowner starts and when the choriesta completes it
  static async choreStatus(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    Chore.findOne({ _id: req.params.choreId }).exec(async (err, chore) => {
      if (err) return res.status(500).json({ message: err.message });
      const status = { status: true };
      chore.choreStarted = status;
      const user = await dbUpdate.choreStatus(
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

  // delete a chore
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

  // update chore details
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
