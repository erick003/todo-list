import { Router, type IRouter } from "express";
import healthRouter from "./routes/health";
import todosRouter from "./routes/todos";
import authRouter from "./routes/auth";
import { requireAuth } from "./middleware/middleware";

const router: IRouter = Router();

router.use(healthRouter);

// Autenticação — rota pública
router.use(authRouter);

// Todos — protegido por JWT
router.use(requireAuth, todosRouter);

export default router;