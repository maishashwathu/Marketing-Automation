import { Router, type IRouter } from "express";
import healthRouter from "./health";
import onboardRouter from "./onboard";
import imagesRouter from "./images";

const router: IRouter = Router();

router.use(healthRouter);
router.use(onboardRouter);
router.use(imagesRouter);

export default router;
