/**
 * AppComponent — COMPONENTE COORDENADOR
 *
 * Após a introdução do TodoService, este componente deixou de gerenciar
 * o estado dos dados (todos, nextId). Agora ele:
 *   1. Injeta o TodoService para delegar todas as operações CRUD.
 *   2. Mantém apenas o estado de UI (qual dialog está aberto, qual
 *      tarefa está selecionada, filtro ativo).
 *   3. Exibe as notificações de toast após cada operação bem-sucedida.
 *
 * Fluxo de dados:
 *   TodoService.todos (signal readonly)
 *       ↓  [todos]="todoService.todos()"
 *   TodoListComponent  →  emite output() de navegação
 *       ↓  (detail / edit / remove / addNew)
 *   AppComponent  →  abre dialogs / chama todoService.remove()
 *       ↓  [(visible)] / [editTarget] / [mode]
 *   TodoFormComponent  →  chama todoService.add() / todoService.update()
 *                          emite output() save para notificação de toast
 *       ↓  (save)
 *   AppComponent  →  exibe toast (dados já persistidos pelo service)
 */

import { Component, signal, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Todo, FilterType, TodoFormData } from './models';
import { TodoService } from './services/todo.service';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoDetailComponent } from './todo-detail/todo-detail.component';
import { TodoFormComponent } from './todo-form/todo-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ToastModule,
    ConfirmDialogModule,
    TodoListComponent,
    TodoDetailComponent,
    TodoFormComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private confirmationService = inject(ConfirmationService);
  private messageService      = inject(MessageService);

  // Injeta o service — fonte de verdade dos dados.
  readonly todoService = inject(TodoService);

  // ── Estado de UI (coordenação de dialogs) ────────────────────────────────
  currentFilter    = signal<FilterType>('all');
  showFormDialog   = signal(false);
  showDetailDialog = signal(false);
  dialogMode       = signal<'add' | 'edit'>('add');
  editTarget       = signal<Todo | null>(null);
  selectedTodo     = signal<Todo | null>(null);

  // ── Coordenação dos dialogs ───────────────────────────────────────────────

  /** Abre o TodoFormComponent no modo INSERIR. */
  openAdd() {
    this.editTarget.set(null);
    this.dialogMode.set('add');
    this.showFormDialog.set(true);
  }

  /** Abre o TodoFormComponent no modo ATUALIZAR com os dados da tarefa. */
  openEdit(todo: Todo) {
    this.editTarget.set(todo);
    this.dialogMode.set('edit');
    this.showDetailDialog.set(false);
    this.showFormDialog.set(true);
  }

  /** Abre o TodoDetailComponent para DETALHAR a tarefa selecionada. */
  openDetail(todo: Todo) {
    this.selectedTodo.set(todo);
    this.showDetailDialog.set(true);
  }

  // ── Handlers de eventos dos filhos ────────────────────────────────────────

  /**
   * Chamado pelo output() save do TodoFormComponent.
   * O service já foi atualizado dentro do próprio TodoFormComponent;
   * este handler apenas exibe o toast de notificação.
   */
  handleSave(data: TodoFormData) {
    if (this.dialogMode() === 'add') {
      this.messageService.add({
        severity: 'success',
        summary: 'Tarefa adicionada',
        detail: `"${data.text}" foi criada com sucesso.`,
        life: 3000,
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Tarefa atualizada',
        detail: `"${data.text}" foi atualizada.`,
        life: 3000,
      });
    }
  }

  /**
   * Chamado pelo output() remove do TodoListComponent.
   * Exibe confirmação e delega a remoção ao TodoService.remove().
   */
  handleDelete(todo: Todo) {
    this.confirmationService.confirm({
      message: `Deseja excluir a tarefa "${todo.text}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.todoService.remove(todo.id);   // ← delega ao service
        this.messageService.add({
          severity: 'warn',
          summary: 'Tarefa removida',
          detail: `"${todo.text}" foi excluída.`,
          life: 3000,
        });
      },
    });
  }
}
