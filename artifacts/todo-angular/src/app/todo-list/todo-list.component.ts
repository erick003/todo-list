/**
 * TodoListComponent — operação LISTAR
 *
 * Uso do service: injeta TodoService para chamar toggle() diretamente,
 * sem precisar emitir um output() para o pai apenas para inverter um campo.
 * Isso demonstra que componentes podem operar o service de forma autônoma
 * para ações simples, enquanto ações que exigem coordenação de UI (abrir
 * dialogs, confirmação) ainda são delegadas ao pai via output().
 *
 * COMUNICAÇÃO COM O AppComponent:
 *   input()  ← todos  : Todo[]      — lista atual (lida do service pelo pai)
 *   input()  ← filter : FilterType  — filtro de exibição
 *   output() → filterChange          — usuário troca o filtro
 *   output() → addNew                — usuário quer incluir nova tarefa
 *   output() → detail                — usuário quer detalhar uma tarefa
 *   output() → edit                  — usuário quer alterar uma tarefa
 *   output() → remove                — usuário quer remover (pai confirma)
 *
 *   toggle (sem output) — chamado diretamente via todoService.toggle(id)
 */

import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Todo, FilterType } from '../models';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, TooltipModule],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  // Service injetado — usado para chamar toggle() diretamente.
  private todoService = inject(TodoService);

  // ── input() — dados recebidos do pai ──────────────────────────────────────
  todos  = input.required<Todo[]>();
  filter = input.required<FilterType>();

  // ── output() — eventos emitidos para o pai ────────────────────────────────
  filterChange = output<FilterType>();
  addNew       = output<void>();
  detail       = output<Todo>();
  edit         = output<Todo>();
  remove       = output<Todo>();
  // Nota: toggle NÃO é mais um output() — é chamado diretamente no service.

  // ── computed() — derivados dos inputs ────────────────────────────────────
  totalCount     = computed(() => this.todos().length);
  activeCount    = computed(() => this.todos().filter(t => !t.completed).length);
  completedCount = computed(() => this.todos().filter(t => t.completed).length);

  filteredTodos = computed(() => {
    const f = this.filter();
    return this.todos().filter(t => {
      if (f === 'active')    return !t.completed;
      if (f === 'completed') return t.completed;
      return true;
    });
  });

  // ── Ação direta no service (operação ALTERNAR STATUS) ─────────────────────
  /**
   * Chama todoService.toggle() diretamente, sem intermediação do pai.
   * O signal todos (recebido via input) será atualizado automaticamente
   * porque o pai o lê de todoService.todos().
   */
  onToggle(id: number): void {
    this.todoService.toggle(id);
  }

  // ── Helpers de exibição ───────────────────────────────────────────────────
  getPriorityLabel(priority: number): string {
    return (['', 'Baixa', 'Média', 'Alta'])[priority] ?? 'Baixa';
  }

  getPrioritySeverity(priority: number): 'success' | 'warning' | 'danger' {
    const map: Record<number, 'success' | 'warning' | 'danger'> = {
      1: 'success',
      2: 'warning',
      3: 'danger',
    };
    return map[priority] ?? 'success';
  }
}
