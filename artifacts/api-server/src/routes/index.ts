import { Router, type IRouter } from "express";
import healthRouter from "./health";
import todosRouter from "./todos";
import authRouter from "./auth";

const router: IRouter = Router();

// Mount auth router on /auth; this exposes POST /api/auth/login.
router.use('/auth', authRouter);
router.use(healthRouter);
router.use(todosRouter);

export default router;
