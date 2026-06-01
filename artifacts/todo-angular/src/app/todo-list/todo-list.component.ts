/**
 * TodoListComponent — operação LISTAR
 *
 * Requisito atendido: componente dedicado exclusivamente à listagem
 * das tarefas, com filtros e estatísticas.
 *
 * COMUNICAÇÃO COM O PAI (AppComponent):
 *
 *   input()  — recebe dados somente-leitura do pai:
 *     • todos  : Todo[]     — lista completa de tarefas
 *     • filter : FilterType — filtro ativo ('all' | 'active' | 'completed')
 *
 *   output() — emite eventos para o pai reagir (sem retorno):
 *     • filterChange → pai atualiza o signal currentFilter
 *     • addNew       → pai abre o TodoFormComponent no modo INCLUIR
 *     • toggle       → pai alterna o campo `completed` da tarefa
 *     • detail       → pai abre o TodoDetailComponent (DETALHAR)
 *     • edit         → pai abre o TodoFormComponent no modo ALTERAR
 *     • remove       → pai exibe confirmação e deleta a tarefa
 *
 *   NOTA: este componente NÃO usa model() porque não precisa de binding
 *   bidirecional — apenas recebe dados e emite intenções.
 */

import { Component, input, output, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Todo, FilterType } from '../models';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, TooltipModule],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  // ── input() — dados recebidos do pai ──────────────────────────────────────
  // input.required<T>() garante em tempo de compilação que o pai sempre
  // forneça o valor; equivale ao antigo @Input() com { required: true }.
  todos  = input.required<Todo[]>();
  filter = input.required<FilterType>();

  // ── output() — eventos emitidos para o pai ────────────────────────────────
  // output<T>() substitui o antigo @Output() EventEmitter<T>.
  // O pai escuta com a sintaxe (evento)="handler($event)" no template.
  filterChange = output<FilterType>();
  addNew       = output<void>();
  toggle       = output<number>();   // emite o id da tarefa
  detail       = output<Todo>();
  edit         = output<Todo>();
  remove       = output<Todo>();

  // ── computed() — valores derivados dos inputs ─────────────────────────────
  // computed() recalcula automaticamente sempre que os signals de que
  // depende (todos, filter) forem atualizados pelo pai.
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
