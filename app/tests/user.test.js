const { before } = require("lodash");
const request = require("supertest");
const app = require("../../app");
import User from "../models/src/user.model";

const user = {
  firstName: "Kevin",
  lastName: "Kirima",
  email: "njine20@gmail.com",
  phoneNumber: "0717708291",
  password: "Gi10807108",
  dateOfBirth: "12/2/1993",
};
var userToken = "";
var loginToken = "";

beforeEach(async () => {
  await User.deleteMany({});
  const newUser = await User(user).save();
  const token = await newUser.generateToken();
  userToken = token;
});
/**
 * @description Test for user signup
 * @returns {object} user
 */

test("Is a user being signed in correctly", async () => {
  await request(app)
    .post("/user/signup")
    .send(user)
    .expect(201)
    .then((response) => {
      loginToken = response.body.user.token;
    });
});
/**
 * @description Test for user login
 * @returns {object} user
 * @expect(200)
 */
test("Should login for a user", async () => {
  await request(app)
    .post("/user/login")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);
});
/**
 * @description Test updating user profile
 * @returns {object} user
 * @expect(200)
 */
test("Update user", async () => {
  await request(app)
    .patch("/user/profile")
    .set("Accept", "application/json")
    .set("Authorization", "Bearer " + userToken)
    .expect("Content-Type", /json/)
    .send({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    })
    .expect(200);
});

/**
 * @description Test get user profile
 * @returns {object} user
 * @expect(200)
 */
test("Get User", async () => {
  await request(app)
    .get("/user/profile")
    .set("Accept", "application/json")
    .set("Authorization", "Bearer " + userToken)
    .expect(200);
});
/**
 * @description Test for logout user
 * @returns {object} user
 * @expect(200)
 */
test("Logout a  User", async () => {
  await request(app)
    .post("/user/logout")
    .set("Accept", "application/json")
    .set("Authorization", "Bearer " + userToken)
    .expect(200);
});
