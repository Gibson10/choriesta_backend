import express from "express";
import passport from "passport";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import Routes from "./app/routes/indexRoutes";
import Database from './app/db/index';
import cors from 'cors';
const fileUpload = require('express-fileupload');
const app = express()

/// Open database connection
Database();
app.use(cors())
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 },
}))
app.use(require("express-session")({
    secret: "Choreista application DB Secret",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, authorization,x-access-token"
    )
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, OPTIONS, PUT, DELETE"
    )
    next();
})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.get('/', async (req, res) => {
    // Health Check
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        environment: process.env.NODE_ENV
    };
    try {
        res.status(200).send({ healthcheck: healthcheck });
    } catch (e) {
        healthcheck.message = e;
        res.status(503).send();
    }
});
app.use(Routes);
module.exports = app;