import { Component, input, output, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Todo, FilterType } from '../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, TooltipModule],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  // ── Inputs ────────────────────────────────────────────────────────────────
  todos  = input.required<Todo[]>();
  filter = input.required<FilterType>();

  // ── Outputs ───────────────────────────────────────────────────────────────
  filterChange = output<FilterType>();
  addNew       = output<void>();
  toggle       = output<number>();
  detail       = output<Todo>();
  edit         = output<Todo>();
  remove       = output<Todo>();

  // ── Computed ──────────────────────────────────────────────────────────────
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

  // ── Helpers ───────────────────────────────────────────────────────────────
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
