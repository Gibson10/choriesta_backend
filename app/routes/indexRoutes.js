import { Router } from "express";
import userRoute from "./user.routes";
import choreRoutes from "./chores.routes";

const routes = Router();
routes.use("api/v1", userRoute);
routes.use("api/v1", choreRoutes);
export default routes;
