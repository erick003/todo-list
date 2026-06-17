/**
 * TodoService — SERVIÇO COM BACKEND REST/JSON
 *
 * Requisito: "O serviço deve utilizar HttpClient para comunicação com o
 * backend nas operações inserir, atualizar, detalhar, remover e listar."
 *
 * Arquitetura:
 *   • Todos os métodos usam HttpClient para comunicar com a API REST em /api.
 *   • O signal privado _todos é mantido como cache local reativo — atualizado
 *     via tap() após cada operação HTTP bem-sucedida. Os componentes continuam
 *     usando todoService.todos() de forma reativa, sem polling.
 *   • Métodos de escrita retornam Observable<T> para que os componentes
 *     possam reagir ao sucesso/erro (exibir toast, navegar etc.).
 *
 * Endpoints consumidos (montados em /api pelo proxy Replit):
 *   GET    /api/todos       → LISTAR
 *   POST   /api/todos       → INSERIR
 *   GET    /api/todos/:id   → DETALHAR
 *   PUT    /api/todos/:id   → ATUALIZAR
 *   DELETE /api/todos/:id   → REMOVER
 */

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Todo, TodoFormData } from '../models';

/** Shape retornada pelo backend (createdAt vem como string ISO 8601). */
interface TodoApi {
  id: number;
  text: string;
  description: string;
  priority: number;
  completed: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);

  private readonly BASE = '/api/todos';

  // Cache reativo local — alimentado pelas respostas HTTP.
  private readonly _todos   = signal<Todo[]>([]);
  private readonly _loading = signal(false);

  /** Lista reativa — componentes consomem via todoService.todos(). */
  readonly todos   = this._todos.asReadonly();
  /** Indica carregamento inicial — use para exibir skeleton/spinner. */
  readonly loading = this._loading.asReadonly();

  // ── Mapeamento API → modelo local ────────────────────────────────────────
  private fromApi(t: TodoApi): Todo {
    return { ...t, createdAt: new Date(t.createdAt) };
  }

  // ── LISTAR — GET /api/todos ──────────────────────────────────────────────
  /**
   * Carrega a lista completa do backend e atualiza o signal _todos.
   * Deve ser chamado em ngOnInit() do TodoListComponent.
   */
  loadAll(): void {
    this._loading.set(true);
    this.http.get<TodoApi[]>(this.BASE).pipe(
      map(items => items.map(t => this.fromApi(t))),
    ).subscribe({
      next: todos => {
        this._todos.set(todos);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  // ── DETALHAR — GET /api/todos/:id ────────────────────────────────────────
  /**
   * Busca uma tarefa pelo id via HTTP.
   * Retorna Observable<Todo> — componentes assinam para fallback quando
   * não há dado no Navigation State (acesso direto pela URL).
   */
  getById(id: number): Observable<Todo> {
    return this.http.get<TodoApi>(`${this.BASE}/${id}`).pipe(
      map(t => this.fromApi(t)),
    );
  }

  // ── INSERIR — POST /api/todos ─────────────────────────────────────────────
  /**
   * Cria um novo todo via POST e insere no início do cache local.
   * O componente assina para navegar/exibir toast após sucesso.
   */
  add(data: TodoFormData): Observable<Todo> {
    return this.http.post<TodoApi>(this.BASE, data).pipe(
      map(t => this.fromApi(t)),
      tap(newTodo => {
        this._todos.update(todos => [newTodo, ...todos]);
      }),
    );
  }

  // ── ATUALIZAR — PUT /api/todos/:id ───────────────────────────────────────
  /**
   * Atualiza o todo via PUT e reflete no cache local.
   * O componente assina para navegar/exibir toast após sucesso.
   */
  update(id: number, data: TodoFormData): Observable<Todo> {
    return this.http.put<TodoApi>(`${this.BASE}/${id}`, data).pipe(
      map(t => this.fromApi(t)),
      tap(updated => {
        this._todos.update(todos =>
          todos.map(t => t.id === id ? updated : t),
        );
      }),
    );
  }

  // ── REMOVER — DELETE /api/todos/:id ─────────────────────────────────────
  /**
   * Remove o todo via DELETE e retira do cache local.
   * O componente assina para exibir toast após sucesso.
   */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`).pipe(
      tap(() => {
        this._todos.update(todos => todos.filter(t => t.id !== id));
      }),
    );
  }

  // ── ALTERNAR STATUS — PUT /api/todos/:id ─────────────────────────────────
  /**
   * Inverte o campo completed e sincroniza com o backend via update().
   * Atalho para não abrir o formulário apenas para marcar como concluída.
   */
  toggle(id: number): Observable<Todo> {
    const todo = this._todos().find(t => t.id === id);
    if (!todo) return EMPTY;
    return this.update(id, { ...todo, completed: !todo.completed });
  }
}
