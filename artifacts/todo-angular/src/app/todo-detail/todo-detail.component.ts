import { Component, input, output, model } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Todo } from '../models/todo.model';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, DialogModule, ButtonModule, TagModule, DividerModule],
  templateUrl: './todo-detail.component.html',
})
export class TodoDetailComponent {
  // ── Inputs / model ────────────────────────────────────────────────────────
  visible = model(false);
  todo    = input<Todo | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────────
  editRequest = output<Todo>();

  // ── Actions ───────────────────────────────────────────────────────────────
  onEdit() {
    const t = this.todo();
    if (t) {
      this.editRequest.emit(t);
      this.visible.set(false);
    }
  }

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
