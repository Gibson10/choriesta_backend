
import { Router } from "express";
import userRoute from './user.routes';
import choreRoutes from './chores.routes';

const routes = Router();
routes.use(userRoute) 
routes.use(choreRoutes);
export default routes;




