import { Component, signal, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Todo, FilterType, TodoFormData } from './models/todo.model';
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
  private nextId              = 4;

  // ── State ─────────────────────────────────────────────────────────────────
  todos = signal<Todo[]>([
    {
      id: 1,
      text: 'Estudar Angular 17 com Signals',
      description: 'Aprender sobre signals, computed e effects para gerenciamento de estado reativo.',
      priority: 3,
      completed: false,
      createdAt: new Date('2026-05-10T09:00:00'),
    },
    {
      id: 2,
      text: 'Configurar PrimeNG no projeto',
      description: 'Instalar e configurar o tema lara-light-blue com os componentes necessários.',
      priority: 2,
      completed: true,
      createdAt: new Date('2026-05-11T14:30:00'),
    },
    {
      id: 3,
      text: 'Criar layout responsivo com Tailwind',
      description: '',
      priority: 1,
      completed: false,
      createdAt: new Date('2026-05-12T08:00:00'),
    },
  ]);

  currentFilter    = signal<FilterType>('all');
  showFormDialog   = signal(false);
  showDetailDialog = signal(false);
  dialogMode       = signal<'add' | 'edit'>('add');
  editTarget       = signal<Todo | null>(null);
  selectedTodo     = signal<Todo | null>(null);

  // ── Dialog coordination ───────────────────────────────────────────────────
  openAdd() {
    this.editTarget.set(null);
    this.dialogMode.set('add');
    this.showFormDialog.set(true);
  }

  openEdit(todo: Todo) {
    this.editTarget.set(todo);
    this.dialogMode.set('edit');
    this.showDetailDialog.set(false);
    this.showFormDialog.set(true);
  }

  openDetail(todo: Todo) {
    this.selectedTodo.set(todo);
    this.showDetailDialog.set(true);
  }

  // ── CRUD handlers (called by child output events) ─────────────────────────
  handleToggle(id: number) {
    this.todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  handleSave(data: TodoFormData) {
    if (this.dialogMode() === 'add') {
      const newTodo: Todo = {
        id: this.nextId++,
        ...data,
        createdAt: new Date(),
      };
      this.todos.update(todos => [newTodo, ...todos]);
      this.messageService.add({
        severity: 'success',
        summary: 'Tarefa adicionada',
        detail: `"${data.text}" foi criada com sucesso.`,
        life: 3000,
      });
    } else {
      const target = this.editTarget();
      if (!target) return;
      this.todos.update(todos =>
        todos.map(t => t.id === target.id ? { ...t, ...data } : t)
      );
      this.messageService.add({
        severity: 'info',
        summary: 'Tarefa atualizada',
        detail: `"${data.text}" foi atualizada.`,
        life: 3000,
      });
    }
  }

  handleDelete(todo: Todo) {
    this.confirmationService.confirm({
      message: `Deseja excluir a tarefa "${todo.text}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.todos.update(todos => todos.filter(t => t.id !== todo.id));
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
