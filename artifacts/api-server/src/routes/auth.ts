import { Router, type IRouter, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

const router: IRouter = Router();
const JWT_SECRET = process.env["SESSION_SECRET"] ?? "changeme-dev-secret";
const JWT_EXPIRES_IN = "8h";
const USERS: Record<string, string> = { admin: "admin123", user: "user123" };

// Endpoint de autenticação para login. Retorna um JWT assinado quando as credenciais são válidas.
router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: unknown; password?: unknown };

  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "username e password são obrigatórios." });
    return;
  }

  const expected = USERS[username];
  if (!expected || expected !== password) {
    res.status(401).json({ message: "Usuário ou senha inválidos." });
    return;
  }

  const token = jwt.sign({ sub: username, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  // Retorna um JWT assinado para armazenamento no cliente e futuras requisições autenticadas.
  res.json({ token });
});

export default router;
