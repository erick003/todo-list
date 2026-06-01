/**
 * TodoDetailComponent — operação DETALHAR
 *
 * Requisito atendido: componente dedicado à exibição completa dos
 * dados de uma tarefa em um dialog modal (PrimeNG <p-dialog>).
 *
 * COMUNICAÇÃO COM O PAI (AppComponent):
 *
 *   model()  — binding BIDIRECIONAL para o estado de visibilidade do dialog:
 *     • visible : boolean
 *       - O pai ESCREVE true para abrir o dialog.
 *       - O componente ESCREVE false para fechar (ao clicar em "Fechar"
 *         ou ao pressionar ESC), e o pai é notificado automaticamente.
 *       - No template do pai: [(visible)]="showDetailDialog"
 *         O [()] é o "banana-in-a-box": combina [input] + (output) em um
 *         único binding, sem precisar declarar input + output separados.
 *
 *   input()  — dado somente-leitura recebido do pai:
 *     • todo : Todo | null — tarefa selecionada para exibição
 *
 *   output() — evento emitido quando o usuário solicita edição:
 *     • editRequest : Todo — pai abre o TodoFormComponent no modo ALTERAR
 */

import { Component, input, output, model } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Todo } from '../models';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, DialogModule, ButtonModule, TagModule, DividerModule],
  templateUrl: './todo-detail.component.html',
})
export class TodoDetailComponent {
  // ── model() — binding bidirecional ────────────────────────────────────────
  // model<T>() cria simultaneamente um input e um output com o mesmo nome.
  // Permite que pai e filho leiam E escrevam o valor, mantendo-os em sincronia.
  // Uso no pai: [(visible)]="showDetailDialog"
  visible = model(false);

  // ── input() — dado somente-leitura recebido do pai ────────────────────────
  todo = input<Todo | null>(null);

  // ── output() — evento de saída para o pai ────────────────────────────────
  editRequest = output<Todo>();

  // ── Ações do dialog ───────────────────────────────────────────────────────
  onEdit() {
    const t = this.todo();
    if (t) {
      this.editRequest.emit(t);   // notifica o pai para abrir o form em modo edição
      this.visible.set(false);    // fecha este dialog via model()
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
