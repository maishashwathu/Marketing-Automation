import { Router, type IRouter } from "express";
import healthRouter from "./health";
import onboardRouter from "./onboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(onboardRouter);

export default router;
