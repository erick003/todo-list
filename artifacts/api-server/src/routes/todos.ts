/**
 * Roteador REST para o recurso Todo.
 *
 * Operações expostas via HTTP (montadas em /api):
 *   GET    /api/todos       → LISTAR todos
 *   POST   /api/todos       → INSERIR novo todo
 *   GET    /api/todos/:id   → DETALHAR por id
 *   PUT    /api/todos/:id   → ATUALIZAR por id
 *   DELETE /api/todos/:id   → REMOVER por id
 *
 * Armazenamento em memória — suficiente para validar a comunicação REST.
 * Troca por Drizzle + Postgres adicionando o pacote @workspace/db.
 */

import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

// ── Modelo ──────────────────────────────────────────────────────────────────
interface Todo {
  id: number;
  text: string;
  description: string;
  priority: number;
  completed: boolean;
  createdAt: string; // ISO 8601 — JSON não serializa Date diretamente
}

interface TodoBody {
  text?: unknown;
  description?: unknown;
  priority?: unknown;
  completed?: unknown;
}

// ── Store em memória ─────────────────────────────────────────────────────────
let todos: Todo[] = [
  {
    id: 1,
    text: "Estudar Angular 17 com Signals",
    description:
      "Aprender sobre signals, computed e effects para gerenciamento de estado reativo.",
    priority: 3,
    completed: false,
    createdAt: "2026-05-10T09:00:00.000Z",
  },
  {
    id: 2,
    text: "Configurar PrimeNG no projeto",
    description:
      "Instalar e configurar o tema lara-light-blue com os componentes necessários.",
    priority: 2,
    completed: true,
    createdAt: "2026-05-11T14:30:00.000Z",
  },
  {
    id: 3,
    text: "Criar layout responsivo com Tailwind",
    description: "",
    priority: 1,
    completed: false,
    createdAt: "2026-05-12T08:00:00.000Z",
  },
];

let nextId = 4;

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseTodoBody(body: TodoBody): Partial<Omit<Todo, "id" | "createdAt">> | string {
  const { text, description, priority, completed } = body;

  if (text !== undefined && (typeof text !== "string" || String(text).trim().length < 3)) {
    return "O campo 'text' deve ser uma string com no mínimo 3 caracteres.";
  }
  if (priority !== undefined && (typeof priority !== "number" || ![1, 2, 3].includes(priority))) {
    return "O campo 'priority' deve ser 1 (Baixa), 2 (Média) ou 3 (Alta).";
  }

  const out: Partial<Omit<Todo, "id" | "createdAt">> = {};
  if (text      !== undefined) out.text        = String(text).trim();
  if (description !== undefined) out.description = typeof description === "string" ? description.trim() : "";
  if (priority  !== undefined) out.priority    = priority as number;
  if (completed !== undefined) out.completed   = Boolean(completed);
  return out;
}

// ── LISTAR — GET /api/todos ──────────────────────────────────────────────────
router.get("/todos", (_req: Request, res: Response) => {
  res.json(todos);
});

// ── DETALHAR — GET /api/todos/:id ────────────────────────────────────────────
router.get("/todos/:id", (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    res.status(404).json({ message: `Todo #${id} não encontrado.` });
    return;
  }

  res.json(todo);
});

// ── INSERIR — POST /api/todos ────────────────────────────────────────────────
router.post("/todos", (req: Request, res: Response) => {
  const parsed = parseTodoBody(req.body as TodoBody);
  if (typeof parsed === "string") {
    res.status(400).json({ message: parsed });
    return;
  }

  const { text, description = "", priority = 2, completed = false } = parsed as Required<typeof parsed>;

  if (!text) {
    res.status(400).json({ message: "O campo 'text' é obrigatório." });
    return;
  }

  const newTodo: Todo = {
    id: nextId++,
    text,
    description,
    priority,
    completed,
    createdAt: new Date().toISOString(),
  };

  todos = [newTodo, ...todos];
  res.status(201).json(newTodo);
});

// ── ATUALIZAR — PUT /api/todos/:id ───────────────────────────────────────────
router.put("/todos/:id", (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  const idx = todos.findIndex((t) => t.id === id);

  if (idx === -1) {
    res.status(404).json({ message: `Todo #${id} não encontrado.` });
    return;
  }

  const parsed = parseTodoBody(req.body as TodoBody);
  if (typeof parsed === "string") {
    res.status(400).json({ message: parsed });
    return;
  }

  const updated: Todo = { ...todos[idx]!, ...parsed };
  todos = todos.map((t) => (t.id === id ? updated : t));
  res.json(updated);
});

// ── REMOVER — DELETE /api/todos/:id ─────────────────────────────────────────
router.delete("/todos/:id", (req: Request, res: Response) => {
  const id = Number(req.params["id"]);
  const exists = todos.some((t) => t.id === id);

  if (!exists) {
    res.status(404).json({ message: `Todo #${id} não encontrado.` });
    return;
  }

  todos = todos.filter((t) => t.id !== id);
  res.status(204).send();
});

export default router;
