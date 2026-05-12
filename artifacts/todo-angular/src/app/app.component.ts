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
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6">
      <div class="max-w-4xl mx-auto">

        <!-- Header -->
        <header class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">To Do List</h1>
            <p class="text-gray-500 text-sm mt-1">Gerencie suas tarefas com eficiência</p>
          </div>
          <p-button
            label="Nova Tarefa"
            icon="pi pi-plus"
            (onClick)="openAddDialog()">
          </p-button>
        </header>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-bold text-blue-600">{{ todos().length }}</p>
            <p class="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">Total</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-bold text-orange-500">{{ activeTodosCount() }}</p>
            <p class="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">Pendentes</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <p class="text-3xl font-bold text-emerald-600">{{ completedTodosCount() }}</p>
            <p class="text-xs text-gray-400 mt-1 uppercase tracking-widest font-medium">Concluídas</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-2 mb-5">
          <p-button
            label="Todas"
            size="small"
            [outlined]="currentFilter() !== 'all'"
            (onClick)="setFilter('all')">
          </p-button>
          <p-button
            label="Pendentes"
            size="small"
            [outlined]="currentFilter() !== 'active'"
            (onClick)="setFilter('active')">
          </p-button>
          <p-button
            label="Concluídas"
            size="small"
            [outlined]="currentFilter() !== 'completed'"
            (onClick)="setFilter('completed')">
          </p-button>
        </div>

        <!-- Empty state -->
        @if (filteredTodos().length === 0) {
          <div class="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
            <i class="pi pi-inbox text-6xl text-gray-200 mb-4 block"></i>
            <p class="text-gray-400 font-medium">Nenhuma tarefa encontrada</p>
            <p class="text-gray-300 text-sm mt-1">Clique em "Nova Tarefa" para começar</p>
          </div>
        }

        <!-- Todo cards -->
        <div class="flex flex-col gap-3">
          @for (todo of filteredTodos(); track todo.id) {
            <div
              class="bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md"
              [class.border-emerald-200]="todo.completed"
              [class.border-gray-100]="!todo.completed">

              <div class="flex items-start gap-4">

                <!-- Toggle button -->
                <div class="pt-0.5 flex-shrink-0">
                  <p-button
                    [icon]="todo.completed ? 'pi pi-check-circle' : 'pi pi-circle'"
                    [text]="true"
                    [rounded]="true"
                    [severity]="todo.completed ? 'success' : 'secondary'"
                    pTooltip="Marcar / desmarcar"
                    tooltipPosition="top"
                    (onClick)="toggleCompleted(todo.id)">
                  </p-button>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      class="font-semibold text-gray-800 truncate"
                      [class.line-through]="todo.completed"
                      [class.text-gray-400]="todo.completed">
                      {{ todo.text }}
                    </span>
                    <p-tag
                      [value]="getPriorityLabel(todo.priority)"
                      [severity]="getPrioritySeverity(todo.priority)">
                    </p-tag>
                    <p-tag
                      [value]="todo.completed ? 'Concluída' : 'Pendente'"
                      [severity]="todo.completed ? 'success' : 'warning'">
                    </p-tag>
                  </div>

                  @if (todo.description) {
                    <p class="text-sm text-gray-400 mt-1.5 line-clamp-1">{{ todo.description }}</p>
                  }

                  <p class="text-xs text-gray-300 mt-2 font-mono">
                    #{{ todo.id }} · {{ todo.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  </p>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-0.5 flex-shrink-0">
                  <p-button
                    icon="pi pi-eye"
                    [text]="true"
                    [rounded]="true"
                    severity="info"
                    pTooltip="Detalhar"
                    tooltipPosition="top"
                    (onClick)="openDetailDialog(todo)">
                  </p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [text]="true"
                    [rounded]="true"
                    pTooltip="Editar"
                    tooltipPosition="top"
                    (onClick)="openEditDialog(todo)">
                  </p-button>
                  <p-button
                    icon="pi pi-trash"
                    [text]="true"
                    [rounded]="true"
                    severity="danger"
                    pTooltip="Excluir"
                    tooltipPosition="top"
                    (onClick)="confirmDelete(todo)">
                  </p-button>
                </div>
              </div>
            </div>
          }
        </div>

      </div>
    </div>

    <!-- Add / Edit Dialog -->
    <p-dialog
      [header]="dialogMode === 'add' ? 'Nova Tarefa' : 'Editar Tarefa'"
      [(visible)]="showFormDialog"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '520px'}">

      <div class="flex flex-col gap-5 pt-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">
            Título <span class="text-red-500">*</span>
          </label>
          <input
            pInputText
            [(ngModel)]="form.text"
            placeholder="Digite o título da tarefa..."
            class="w-full" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Descrição</label>
          <textarea
            pInputTextarea
            [(ngModel)]="form.description"
            placeholder="Adicione uma descrição opcional..."
            rows="3"
            class="w-full resize-none">
          </textarea>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Prioridade</label>
          <p-dropdown
            [options]="priorityOptions"
            [(ngModel)]="form.priority"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione..."
            styleClass="w-full">
          </p-dropdown>
        </div>

        <div class="flex items-center gap-3">
          <p-checkbox
            [(ngModel)]="form.completed"
            [binary]="true"
            inputId="formCompleted">
          </p-checkbox>
          <label for="formCompleted" class="text-sm text-gray-700 cursor-pointer select-none">
            Marcar como concluída
          </label>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button label="Cancelar" [text]="true" (onClick)="closeFormDialog()"></p-button>
          <p-button
            label="Salvar"
            icon="pi pi-check"
            [disabled]="!form.text.trim()"
            (onClick)="saveForm()">
          </p-button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Detail Dialog -->
    <p-dialog
      header="Detalhes da Tarefa"
      [(visible)]="showDetailDialog"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{width: '480px'}">

      @if (selectedTodo) {
        <div class="py-2 flex flex-col gap-4">

          <div>
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Título</label>
            <p class="text-gray-900 font-semibold mt-2 text-lg leading-snug">{{ selectedTodo.text }}</p>
          </div>

          <p-divider styleClass="my-0"></p-divider>

          <div>
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Descrição</label>
            <p class="text-gray-600 mt-2 leading-relaxed">
              {{ selectedTodo.description || 'Sem descrição' }}
            </p>
          </div>

          <p-divider styleClass="my-0"></p-divider>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Prioridade</label>
              <div class="mt-2">
                <p-tag
                  [value]="getPriorityLabel(selectedTodo.priority)"
                  [severity]="getPrioritySeverity(selectedTodo.priority)">
                </p-tag>
              </div>
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Status</label>
              <div class="mt-2">
                <p-tag
                  [value]="selectedTodo.completed ? 'Concluída' : 'Pendente'"
                  [severity]="selectedTodo.completed ? 'success' : 'warning'">
                </p-tag>
              </div>
            </div>
          </div>

          <p-divider styleClass="my-0"></p-divider>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-widest">ID</label>
              <p class="text-gray-600 mt-2 font-mono text-sm">#{{ selectedTodo.id }}</p>
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Criado em</label>
              <p class="text-gray-600 mt-2 text-sm">{{ selectedTodo.createdAt | date:'dd/MM/yyyy' }}</p>
              <p class="text-gray-400 text-xs">{{ selectedTodo.createdAt | date:'HH:mm' }}</p>
            </div>
          </div>

        </div>
      }

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button
            label="Editar"
            icon="pi pi-pencil"
            [outlined]="true"
            (onClick)="editFromDetail()">
          </p-button>
          <p-button label="Fechar" (onClick)="showDetailDialog = false"></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class AppComponent {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

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

  activeTodosCount = computed(() => this.todos().filter(t => !t.completed).length);
  completedTodosCount = computed(() => this.todos().filter(t => t.completed).length);

  filteredTodos = computed(() => {
    const filter = this.currentFilter();
    return this.todos().filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    });
  });

  priorityOptions = [
    { label: 'Baixa', value: 1 },
    { label: 'Média', value: 2 },
    { label: 'Alta', value: 3 },
  ];

  showFormDialog = false;
  showDetailDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingId: number | null = null;
  selectedTodo: Todo | null = null;

  form = {
    text: '',
    description: '',
    priority: 2,
    completed: false,
  };

  getPriorityLabel(priority: number): string {
    return (['', 'Baixa', 'Média', 'Alta'])[priority] ?? 'Baixa';
  }

  getPrioritySeverity(priority: number): 'success' | 'warning' | 'danger' {
    const map: Record<number, 'success' | 'warning' | 'danger'> = { 1: 'success', 2: 'warning', 3: 'danger' };
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

  openAddDialog() {
    this.dialogMode = 'add';
    this.form = { text: '', description: '', priority: 2, completed: false };
    this.showFormDialog = true;
  }

  openEditDialog(todo: Todo) {
    this.dialogMode = 'edit';
    this.editingId = todo.id;
    this.form = {
      text: todo.text,
      description: todo.description,
      priority: todo.priority,
      completed: todo.completed,
    };
    this.showDetailDialog = false;
    this.showFormDialog = true;
  }

  closeFormDialog() {
    this.showFormDialog = false;
  }

  saveForm() {
    const text = this.form.text.trim();
    if (!text) return;

    if (this.dialogMode === 'add') {
      const newTodo: Todo = {
        id: this.nextId++,
        text,
        description: this.form.description.trim(),
        priority: this.form.priority,
        completed: this.form.completed,
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
        todos.map(t => t.id === this.editingId
          ? { ...t, text, description: this.form.description.trim(), priority: this.form.priority, completed: this.form.completed }
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
    this.selectedTodo = todo;
    this.showDetailDialog = true;
  }

  editFromDetail() {
    if (this.selectedTodo) {
      this.openEditDialog(this.selectedTodo);
    }
  }

  confirmDelete(todo: Todo) {
    this.confirmationService.confirm({
      message: `Deseja excluir a tarefa "<strong>${todo.text}</strong>"?`,
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
