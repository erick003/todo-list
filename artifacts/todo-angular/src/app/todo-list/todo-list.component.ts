/**
 * TodoListComponent — operação LISTAR (rota: /todos)
 *
 * Mudanças com a introdução do backend REST:
 *   • ngOnInit() chama todoService.loadAll() para buscar via GET /api/todos.
 *   • onToggle() assina todoService.toggle() — PUT /api/todos/:id.
 *   • onDelete() assina todoService.remove() — DELETE /api/todos/:id.
 *   • O signal todoService.todos() continua sendo a fonte reativa da UI;
 *     é atualizado automaticamente após cada resposta HTTP via tap().
 *
 * Passagem de dados para rotas filhas (mantida do requisito anterior):
 *   goToDetail(todo) → router.navigate(['/todos', id], { state: { todo } })
 *   goToEdit(todo)   → router.navigate(['/todos', id, 'edit'], { state: { todo } })
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Todo, FilterType } from '../models';
import { TodoService } from '../services/todo.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, TooltipModule, ProgressSpinnerModule],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent implements OnInit {
  private todoService         = inject(TodoService);
  private router              = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService      = inject(MessageService);
  private auth                = inject(AuthService);

  filter = signal<FilterType>('all');

  // Delegado ao service — alimentado pelo GET /api/todos no loadAll().
  readonly loading = this.todoService.loading;

  totalCount     = computed(() => this.todoService.todos().length);
  activeCount    = computed(() => this.todoService.todos().filter(t => !t.completed).length);
  completedCount = computed(() => this.todoService.todos().filter(t => t.completed).length);

  filteredTodos = computed(() => {
    const f = this.filter();
    return this.todoService.todos().filter(t => {
      if (f === 'active')    return !t.completed;
      if (f === 'completed') return t.completed;
      return true;
    });
  });

  // ── Inicialização — busca a lista no backend ──────────────────────────────
  ngOnInit(): void {
    // GET /api/todos → preenche todoService.todos() via signal
    this.todoService.loadAll();
  }

  // ── Navegação — envia o todo via state ────────────────────────────────────

  goToAdd(): void {
    this.router.navigate(['/todos', 'new']);
  }

  /** Navega para DETALHAR passando o todo via Navigation State. */
  goToDetail(todo: Todo): void {
    this.router.navigate(['/todos', todo.id], { state: { todo } });
  }

  /** Navega para ATUALIZAR passando o todo via Navigation State. */
  goToEdit(todo: Todo): void {
    this.router.navigate(['/todos', todo.id, 'edit'], { state: { todo } });
  }

  // ── Operações HTTP via service ────────────────────────────────────────────

  /** PUT /api/todos/:id — alterna completed. */
  onToggle(id: number): void {
    this.todoService.toggle(id).subscribe({
      error: () => this.messageService.add({
        severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar a tarefa.', life: 3000,
      }),
    });
  }

  /** DELETE /api/todos/:id — remove após confirmação. */
  onDelete(todo: Todo): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a tarefa "${todo.text}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.todoService.remove(todo.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'warn', summary: 'Tarefa removida',
              detail: `"${todo.text}" foi excluída.`, life: 3000,
            });
          },
          error: () => this.messageService.add({
            severity: 'error', summary: 'Erro', detail: 'Não foi possível remover a tarefa.', life: 3000,
          }),
        });
      },
    });
  }

  // ── Helpers de exibição ───────────────────────────────────────────────────
  getPriorityLabel(priority: number): string {
    return (['', 'Baixa', 'Média', 'Alta'])[priority] ?? 'Baixa';
  }

  getPrioritySeverity(priority: number): 'success' | 'warning' | 'danger' {
    const map: Record<number, 'success' | 'warning' | 'danger'> = {
      1: 'success', 2: 'warning', 3: 'danger',
    };
    return map[priority] ?? 'success';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
