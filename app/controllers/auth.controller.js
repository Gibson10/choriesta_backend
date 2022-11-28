import adaptRequest from "../helpers/adaptRequest";
import { makeHttpError } from "../helpers/httpHelper";
import Helper from "../helpers/helper";
import User from "../models/src/user.model";
import randomGenerate from "../helpers/codeGenerate";
import { mailer } from "../helpers/sendGrid";

import { Request, Response, NextFunction } from "express";

export default class AuthController {
  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */
  //login a user
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
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */
  /// create a new user
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

 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns
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
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */

  //resend confirmation code
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
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */

  //send a confirmation that a user's email is registered
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
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */

  /// Log out from current session
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
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns
   */

  /// Log out all sessions from every devices
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
