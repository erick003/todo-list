/**
 * TodoListComponent — operação LISTAR (rota: /todos)
 *
 * Requisito: "O componente de LISTAGEM envie informação na ativação das
 * rotas de DETALHE E ATUALIZAÇÃO."
 *
 * Ao navegar para detalhe ou edição, o objeto Todo completo é passado via
 * Navigation State (History API):
 *   router.navigate(['/todos', todo.id],          { state: { todo } }) → detalhe
 *   router.navigate(['/todos', todo.id, 'edit'],  { state: { todo } }) → edição
 *
 * O componente de destino lê history.state.todo e usa esse valor diretamente,
 * sem precisar buscar no service novamente (evita round-trip). Se o usuário
 * acessar a URL diretamente (sem passar pela lista), o fallback usa getById().
 *
 * Com rotas, este componente deixou de usar input() e output() para dados —
 * agora gerencia seu próprio estado (filter) e navega diretamente via Router.
 */

import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Todo, FilterType } from '../models';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, TooltipModule],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  private todoService         = inject(TodoService);
  private router              = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService      = inject(MessageService);

  // Filtro gerenciado localmente (não vem mais via input do pai).
  filter = signal<FilterType>('all');

  // Computed a partir do signal do service — reage automaticamente a qualquer CRUD.
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

  // ── Navegação — envia o todo via state ────────────────────────────────────

  /** Ativa a rota INCLUIR (/todos/new). */
  goToAdd(): void {
    this.router.navigate(['/todos', 'new']);
  }

  /**
   * Ativa a rota DETALHAR (/todos/:id) e passa o objeto todo via state.
   * Requisito: "LISTAGEM envie informação na ativação da rota de DETALHE."
   */
  goToDetail(todo: Todo): void {
    this.router.navigate(['/todos', todo.id], { state: { todo } });
  }

  /**
   * Ativa a rota ATUALIZAR (/todos/:id/edit) e passa o objeto todo via state.
   * Requisito: "LISTAGEM envie informação na ativação da rota de ATUALIZAÇÃO."
   */
  goToEdit(todo: Todo): void {
    this.router.navigate(['/todos', todo.id, 'edit'], { state: { todo } });
  }

  // ── Operações diretas no service ──────────────────────────────────────────

  /** Alterna completed diretamente via service — sem navegação. */
  onToggle(id: number): void {
    this.todoService.toggle(id);
  }

  /** Exibe confirmação e delega remoção ao service. */
  onDelete(todo: Todo): void {
    this.confirmationService.confirm({
      message: `Deseja excluir a tarefa "${todo.text}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.todoService.remove(todo.id);
        this.messageService.add({
          severity: 'warn',
          summary: 'Tarefa removida',
          detail: `"${todo.text}" foi excluída.`,
          life: 3000,
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
}
