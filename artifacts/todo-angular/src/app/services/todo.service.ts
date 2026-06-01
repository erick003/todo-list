/**
 * TodoService — SERVIÇO DE DADOS
 *
 * Requisito atendido: "Adicione um service para guardar as informações do
 * model de seu sistema nas operações inserir, atualizar, detalhar, listar
 * e remover de um modelo."
 *
 * Responsabilidades:
 *   • É a única fonte de verdade do estado da lista (signal _todos).
 *   • Expõe o signal como readonly para os componentes não escreverem
 *     diretamente — toda mutação passa pelos métodos do service.
 *   • Fornece os 5 métodos CRUD exigidos:
 *       getAll()   → listar
 *       getById()  → detalhar
 *       add()      → inserir
 *       update()   → atualizar
 *       remove()   → remover
 *     Bônus: toggle() para alternar completed sem reabrir o formulário.
 *
 * Uso nos componentes (injeção via inject()):
 *   private todoService = inject(TodoService);
 */

import { Injectable, signal } from '@angular/core';
import { Todo, TodoFormData } from '../models';

@Injectable({ providedIn: 'root' })
export class TodoService {

  // Estado privado — somente este service pode escrever aqui.
  private readonly _todos = signal<Todo[]>([
    {
      id: 1,
      text: 'Estudar Angular 17 com Signals',
      description: 'Aprender sobre signals, computed e effects para gerenciamento de estado reativo.',
      priority: 3,
      completed: false,
      createdAt: new Date('2026-05-10T09:00:00'),
    },
    {
      id: 2,
      text: 'Configurar PrimeNG no projeto',
      description: 'Instalar e configurar o tema lara-light-blue com os componentes necessários.',
      priority: 2,
      completed: true,
      createdAt: new Date('2026-05-11T14:30:00'),
    },
    {
      id: 3,
      text: 'Criar layout responsivo com Tailwind',
      description: '',
      priority: 1,
      completed: false,
      createdAt: new Date('2026-05-12T08:00:00'),
    },
  ]);

  // Contador privado para geração de IDs únicos.
  private nextId = 4;

  /**
   * Signal público somente-leitura.
   * Componentes leem via todoService.todos() sem poder modificar diretamente.
   */
  readonly todos = this._todos.asReadonly();

  // ── LISTAR ────────────────────────────────────────────────────────────────
  /** Retorna o snapshot atual da lista. */
  getAll(): Todo[] {
    return this._todos();
  }

  // ── DETALHAR ──────────────────────────────────────────────────────────────
  /** Busca uma tarefa pelo id. Retorna undefined se não encontrada. */
  getById(id: number): Todo | undefined {
    return this._todos().find(t => t.id === id);
  }

  // ── INSERIR ───────────────────────────────────────────────────────────────
  /** Cria uma nova tarefa, insere no início da lista e retorna o objeto criado. */
  add(data: TodoFormData): Todo {
    const newTodo: Todo = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
    };
    this._todos.update(todos => [newTodo, ...todos]);
    return newTodo;
  }

  // ── ATUALIZAR ─────────────────────────────────────────────────────────────
  /** Mescla os novos dados na tarefa de id informado. */
  update(id: number, data: TodoFormData): void {
    this._todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, ...data } : t)
    );
  }

  // ── REMOVER ───────────────────────────────────────────────────────────────
  /** Remove a tarefa de id informado da lista. */
  remove(id: number): void {
    this._todos.update(todos => todos.filter(t => t.id !== id));
  }

  // ── ALTERNAR STATUS ───────────────────────────────────────────────────────
  /** Inverte o campo completed da tarefa — atalho para não abrir o formulário. */
  toggle(id: number): void {
    this._todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }
}
