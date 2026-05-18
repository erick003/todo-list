import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';

export interface Todo {
  id: number;
  text: string;
  description: string;
  priority: number;
  completed: boolean;
  createdAt: Date;
}

export type FilterType = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DialogModule,
    DropdownModule,
    CheckboxModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    DividerModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private confirmationService = inject(ConfirmationService);
  private messageService      = inject(MessageService);

  private nextId = 4;

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

  currentFilter = signal<FilterType>('all');

  activeTodosCount  = computed(() => this.todos().filter(t => !t.completed).length);
  completedTodosCount = computed(() => this.todos().filter(t => t.completed).length);

  filteredTodos = computed(() => {
    const f = this.currentFilter();
    return this.todos().filter(t => {
      if (f === 'active')    return !t.completed;
      if (f === 'completed') return t.completed;
      return true;
    });
  });

  priorityOptions = [
    { label: 'Baixa', value: 1 },
    { label: 'Média', value: 2 },
    { label: 'Alta',  value: 3 },
  ];

  // ── Dialog state ─────────────────────────────────────────────────────────
  showFormDialog   = false;
  showDetailDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingId: number | null   = null;
  selectedTodo: Todo | null  = null;

  // ── Signal Form ───────────────────────────────────────────────────────────
  // Field values
  formText        = signal('');
  formDescription = signal('');
  formPriority    = signal<number>(2);
  formCompleted   = signal(false);

  // Touched state (error only shows after field interaction)
  textTouched        = signal(false);
  descriptionTouched = signal(false);
  priorityTouched    = signal(false);

  // Computed validation errors — null means valid
  textError = computed<string | null>(() => {
    const v = this.formText().trim();
    if (!v)             return 'O título é obrigatório.';
    if (v.length < 3)   return 'O título deve ter no mínimo 3 caracteres.';
    if (v.length > 100) return 'O título deve ter no máximo 100 caracteres.';
    return null;
  });

  descriptionError = computed<string | null>(() => {
    const v = this.formDescription();
    if (v.length > 500) return 'A descrição deve ter no máximo 500 caracteres.';
    return null;
  });

  priorityError = computed<string | null>(() => {
    const v = this.formPriority();
    if (v === null || v === undefined) return 'Selecione uma prioridade.';
    return null;
  });

  // Form is valid only when all fields pass their rules
  isFormValid = computed(() =>
    this.textError()        === null &&
    this.descriptionError() === null &&
    this.priorityError()    === null
  );

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

  setFilter(filter: FilterType) {
    this.currentFilter.set(filter);
  }

  toggleCompleted(id: number) {
    this.todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  // ── Form lifecycle ────────────────────────────────────────────────────────
  private resetSignalForm() {
    this.formText.set('');
    this.formDescription.set('');
    this.formPriority.set(2);
    this.formCompleted.set(false);
    this.textTouched.set(false);
    this.descriptionTouched.set(false);
    this.priorityTouched.set(false);
  }

  openAddDialog() {
    this.dialogMode = 'add';
    this.resetSignalForm();
    this.showFormDialog = true;
  }

  openEditDialog(todo: Todo) {
    this.dialogMode = 'edit';
    this.editingId  = todo.id;
    this.formText.set(todo.text);
    this.formDescription.set(todo.description);
    this.formPriority.set(todo.priority);
    this.formCompleted.set(todo.completed);
    this.textTouched.set(false);
    this.descriptionTouched.set(false);
    this.priorityTouched.set(false);
    this.showDetailDialog = false;
    this.showFormDialog   = true;
  }

  closeFormDialog() {
    this.showFormDialog = false;
  }

  /** Touch all fields to surface errors before saving (called on footer Save click). */
  touchAllFields() {
    this.textTouched.set(true);
    this.descriptionTouched.set(true);
    this.priorityTouched.set(true);
  }

  saveForm() {
    this.touchAllFields();
    if (!this.isFormValid()) return;

    const text        = this.formText().trim();
    const description = this.formDescription().trim();
    const priority    = this.formPriority();
    const completed   = this.formCompleted();

    if (this.dialogMode === 'add') {
      const newTodo: Todo = {
        id: this.nextId++,
        text,
        description,
        priority,
        completed,
        createdAt: new Date(),
      };
      this.todos.update(todos => [newTodo, ...todos]);
      this.messageService.add({
        severity: 'success',
        summary: 'Tarefa adicionada',
        detail: `"${text}" foi criada com sucesso.`,
        life: 3000,
      });
    } else {
      this.todos.update(todos =>
        todos.map(t =>
          t.id === this.editingId
            ? { ...t, text, description, priority, completed }
            : t
        )
      );
      this.messageService.add({
        severity: 'info',
        summary: 'Tarefa atualizada',
        detail: `"${text}" foi atualizada.`,
        life: 3000,
      });
    }

    this.showFormDialog = false;
  }

  openDetailDialog(todo: Todo) {
    this.selectedTodo    = todo;
    this.showDetailDialog = true;
  }

  editFromDetail() {
    if (this.selectedTodo) this.openEditDialog(this.selectedTodo);
  }

  confirmDelete(todo: Todo) {
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
