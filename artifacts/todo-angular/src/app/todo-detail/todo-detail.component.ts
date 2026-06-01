/**
 * TodoDetailComponent — operação DETALHAR
 *
 * Uso do service: injeta TodoService e chama getById() em onEdit() para
 * garantir que os dados enviados ao formulário são sempre a versão mais
 * recente armazenada no service — não a snapshot passada como input().
 *
 * COMUNICAÇÃO COM O AppComponent:
 *   model()  ↔ visible      — two-way binding para abrir/fechar o dialog
 *   input()  ← todo         — tarefa selecionada para exibição
 *   output() → editRequest  — solicita ao pai que abra o formulário de edição
 */

import { Component, input, output, model, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Todo } from '../models';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, DialogModule, ButtonModule, TagModule, DividerModule],
  templateUrl: './todo-detail.component.html',
})
export class TodoDetailComponent {
  // Service injetado — usado para obter a versão mais recente da tarefa em onEdit().
  private todoService = inject(TodoService);

  // ── model() — two-way binding de visibilidade ─────────────────────────────
  visible = model(false);

  // ── input() — tarefa selecionada para exibição ────────────────────────────
  todo = input<Todo | null>(null);

  // ── output() — solicita abertura do formulário de edição no pai ───────────
  editRequest = output<Todo>();

  // ── Ações ─────────────────────────────────────────────────────────────────
  onEdit() {
    const t = this.todo();
    if (t) {
      // Busca a versão mais recente no service (getById) para garantir
      // que alterações feitas após a abertura do detalhe sejam refletidas.
      const fresh = this.todoService.getById(t.id) ?? t;
      this.editRequest.emit(fresh);
      this.visible.set(false);
    }
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
