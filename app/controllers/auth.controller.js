import adaptRequest from "../helpers/adaptRequest";
import { makeHttpError } from "../helpers/httpHelper";
import Helper from "../helpers/helper";
import User from "../models/src/user.model";
import randomGenerate from "../helpers/codeGenerate";
import { mailer } from "../helpers/sendGrid";

import { Request, Response, NextFunction } from "express";

export default class AuthController {
  /**
   *
   * login()
   *
   * This static method logs a user in to their account.
   *
   * @param {Object} req - The HTTP request object
   * @param {Object} res - The HTTP response object
   *
   * @returns {Object} A response object containing the user and the token
   *
   * @throws {Error} If the credentials provided are not valid.
   */

  static async login(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    const credentials = Helper.requestBody(body);
    const { errors, isValid } = Helper.validateLoginInput(req.body);

    try {
      if (!isValid) {
        return res.status(400).send(
          makeHttpError({
            error: errors,
          })
        );
      }

      const checkUser = await User.findOne({ email: body.email }).populate(
        "chores.choreId"
      );
      if (!checkUser) {
        errors.email = "No such account";
        return res.status(400).send(makeHttpError({ error: errors }));
      }

      const user = await User.findUserByCredentials(
        credentials.email,
        credentials.password
      );
      const token = await user.generateToken();
      return res.status(200).send({ status: 200, user, token });
    } catch (e) {
      return res.status(400).send(makeHttpError({ error: e.message }));
    }
  }

  /**
   * createNewUser is a static async method used to register a new user in the system.
   *
   * @param {object} req - the request object containing the request data
   * @param {object} res - the response object used to respond to the request
   *
   * @returns {object} - either an error object or a success object containing the newly created user and token
   *
   *
   * The method first adapts the request data and validates the inputs using the Helper.validateLoginInput method. It then checks if the user exists using the User.findOne method and returns an error if the user already exists.
   *
   * If the user does not exist, the method creates a new instance of the User model, generates a token and a signup code and then sends a mailer to the user's email address.
   *
   * Finally, the method returns a success response with the new user and token.
   */

  static async createNewUser(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    const data = Helper.requestBody(body);
    const { errors, isValid } = Helper.validateLoginInput(body);
    const checkUser = await User.findOne({ email: body.email });
    try {
      if (!isValid) {
        return res.status(400).send(
          makeHttpError({
            error: errors,
          })
        );
      }

      if (checkUser) {
        errors.email = "Email already exists";
        return res.status(400).send(
          makeHttpError({
            error: errors,
          })
        );
      }
      const user = await new User(data).save();
      const token = await user.generateToken();
      const code = await user.generateSignUpCode();
      await user.generateresetPasswordCode();
      // await mailer(user.email, code);

      return res.status(201).send({ user, token });
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
   * @name confirmUser
   * @description Confirms a user based on the registration or password reset code provided
   *
   * @param {Object} req The request object
   * @param {Object} res The response object
   *
   * @returns {Object} The user object
   */

  //confirm whether a user is registered
  static async confirmUser(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    try {
      const user = req.user;
      if (
        body.registerCode === user.registerCode ||
        body.resetPasswordCode === user.resetPasswordCode
      ) {
        await user.confirmUser();
        return res.status(200).send({ user: user });
      } else {
        return res.status(400).send({
          error: "Wrong confirmation code provided, please try again",
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
   * @name resendCode
   * @description This method is used to resend the code to the user's email
   * @async
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @returns {Object} The response object with the updated user
   *
   * @throws {HttpError} Will throw an error if there is an internal issue
   */

  static async resendCode(req, res) {
    try {
      const user = req.user;
      await mailer(user.email, user.registerCode);
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
   * @name confirmEmail
   * @description Confirm a user's email address
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   *
   * @returns {Object} The user and token
   */

  static async confirmEmail(req, res) {
    const httpRequest = adaptRequest(req);
    const { body } = httpRequest;
    const data = Helper.requestBody(body);
    const checkUser = await User.findOne({ email: body.email });
    try {
      await mailer(checkUser.email, checkUser.resetPasswordCode);
      return res
        .status(200)
        .send({ user: checkUser, token: checkUser.tokens[0].token });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: "No account registered under that email",
        })
      );
    }
  }

  /**
   * @name logout
   * @description Logs the user out of their account.
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} - Returns a response indicating success or failure
   */

  static async logout(req, res) {
    try {
      req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token;
      });
      await req.user.save();
      return res.status(200).send({ success: true });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: e.message,
        })
      );
    }
  }

  /**
   * @name logoutAll
   * @description Logs out all active sessions for an authenticated user
   * @async
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   *
   * @returns {Object} - The response object containing a success flag
   */

  static async logoutAll(req, res) {
    try {
      req.user.tokens = [];
      req.user.save();
      return res.status(200).send({ success: true });
    } catch (e) {
      return res.status(500).send(
        makeHttpError({
          error: e.message,
        })
      );
    }
  }
}
