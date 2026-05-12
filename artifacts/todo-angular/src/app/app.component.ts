import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type FilterType = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-10px)' }),
          stagger('40ms', [
            animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(24px)' }))
        ], { optional: true })
      ])
    ]),
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="min-h-screen flex flex-col items-center py-16 px-4">

      <!-- Header -->
      <div class="w-full max-w-lg mb-8 text-center" @fadeSlide>
        <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-1">
          ✅ To Do List
        </h1>
        <p class="text-gray-400 text-sm">Organize suas tarefas com simplicidade</p>
      </div>

      <!-- Card principal -->
      <div class="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-violet-100/50 border border-violet-100/60 overflow-hidden" @fadeSlide>

        <!-- Input de nova tarefa -->
        <div class="p-5 border-b border-gray-100">
          <div class="flex gap-3">
            <input
              type="text"
              [(ngModel)]="newTodoText"
              (keyup.enter)="addTodo()"
              placeholder="Adicionar nova tarefa..."
              maxlength="200"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:bg-white
                     transition-all duration-150"
            />
            <button
              (click)="addTodo()"
              [disabled]="!newTodoText.trim()"
              class="px-5 py-3 bg-violet-600 text-white text-sm font-semibold rounded-xl
                     hover:bg-violet-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-150 shadow-md shadow-violet-200 whitespace-nowrap"
            >
              + Adicionar
            </button>
          </div>
        </div>

        <!-- Filtros -->
        <div class="flex items-center gap-1.5 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <button class="filter-btn" [class.active]="currentFilter() === 'all'" (click)="setFilter('all')">
            Todas <span class="ml-1 text-xs opacity-70">({{ todos().length }})</span>
          </button>
          <button class="filter-btn" [class.active]="currentFilter() === 'active'" (click)="setFilter('active')">
            Pendentes <span class="ml-1 text-xs opacity-70">({{ activeTodosCount() }})</span>
          </button>
          <button class="filter-btn" [class.active]="currentFilter() === 'completed'" (click)="setFilter('completed')">
            Concluídas <span class="ml-1 text-xs opacity-70">({{ completedTodosCount() }})</span>
          </button>
          @if (completedTodosCount() > 0) {
            <button
              (click)="clearCompleted()"
              class="ml-auto text-xs text-red-400 hover:text-red-600 transition-colors duration-150 font-medium whitespace-nowrap"
            >
              Limpar concluídas
            </button>
          }
        </div>

        <!-- Lista de tarefas -->
        <div class="divide-y divide-gray-100 min-h-20">
          @if (filteredTodos().length === 0) {
            <div class="flex flex-col items-center justify-center py-14 text-center" @fadeSlide>
              @if (todos().length === 0) {
                <div class="text-4xl mb-3">📝</div>
                <p class="text-gray-400 text-sm font-medium">Nenhuma tarefa ainda</p>
                <p class="text-gray-300 text-xs mt-1">Adicione sua primeira tarefa acima</p>
              } @else {
                <div class="text-4xl mb-3">🎉</div>
                <p class="text-gray-400 text-sm font-medium">Nenhuma tarefa aqui</p>
                <p class="text-gray-300 text-xs mt-1">Troque o filtro para ver outras tarefas</p>
              }
            </div>
          } @else {
            <ul [@listAnimation]="filteredTodos().length">
              @for (todo of filteredTodos(); track todo.id) {
                <li class="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/70 group transition-colors duration-100">
                  <!-- Checkbox circular -->
                  <button
                    (click)="toggleTodo(todo.id)"
                    class="flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-150 flex items-center justify-center"
                    [class.border-violet-500]="todo.completed"
                    [class.bg-violet-500]="todo.completed"
                    [class.border-gray-300]="!todo.completed"
                    [attr.aria-label]="todo.completed ? 'Desmarcar' : 'Marcar como concluída'"
                  >
                    @if (todo.completed) {
                      <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    }
                  </button>

                  <!-- Texto -->
                  @if (editingId() === todo.id) {
                    <input
                      type="text"
                      [(ngModel)]="editingText"
                      (keyup.enter)="saveEdit(todo.id)"
                      (keyup.escape)="cancelEdit()"
                      (blur)="saveEdit(todo.id)"
                      class="flex-1 px-2 py-0.5 text-sm text-gray-700 border border-violet-400 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                      [id]="'edit-' + todo.id"
                    />
                  } @else {
                    <span
                      class="flex-1 text-sm cursor-pointer select-none transition-colors duration-150"
                      [class.text-gray-700]="!todo.completed"
                      [class.text-gray-400]="todo.completed"
                      [class.line-through]="todo.completed"
                      (dblclick)="startEdit(todo)"
                      title="Clique duplo para editar"
                    >
                      {{ todo.text }}
                    </span>
                  }

                  <!-- Ações -->
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                    @if (editingId() !== todo.id) {
                      <button
                        (click)="startEdit(todo)"
                        class="p-1.5 text-gray-400 hover:text-violet-500 rounded-lg hover:bg-violet-50 transition-all duration-150"
                        title="Editar"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                    }
                    <button
                      (click)="deleteTodo(todo.id)"
                      class="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-150"
                      title="Excluir"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </li>
              }
            </ul>
          }
        </div>

        <!-- Footer -->
        @if (todos().length > 0) {
          <div class="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between" @fadeSlide>
            <span class="text-xs text-gray-400">
              @if (activeTodosCount() === 0) {
                Todas as tarefas concluídas! 🎉
              } @else {
                {{ activeTodosCount() }} {{ activeTodosCount() === 1 ? 'tarefa pendente' : 'tarefas pendentes' }}
              }
            </span>
            @if (todos().length > 1) {
              <button
                (click)="toggleAll()"
                class="text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors duration-150"
              >
                {{ activeTodosCount() > 0 ? 'Marcar todas' : 'Desmarcar todas' }}
              </button>
            }
          </div>
        }
      </div>

      <!-- Dica -->
      <p class="mt-6 text-xs text-gray-400 text-center" @fadeSlide>
        Pressione <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500 shadow-sm">Enter</kbd> para adicionar
        &nbsp;·&nbsp; Duplo clique para editar
      </p>
    </div>
  `
})
export class AppComponent {
  newTodoText = '';
  editingText = '';
  private nextId = 4;

  todos = signal<Todo[]>([
    { id: 1, text: 'Criar minha primeira tarefa', completed: false },
    { id: 2, text: 'Explorar os filtros de tarefas', completed: false },
    { id: 3, text: 'Marcar uma tarefa como concluída', completed: true },
  ]);

  currentFilter = signal<FilterType>('all');
  editingId = signal<number | null>(null);

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

  addTodo() {
    const text = this.newTodoText.trim();
    if (!text) return;
    this.todos.update(todos => [
      { id: this.nextId++, text, completed: false },
      ...todos
    ]);
    this.newTodoText = '';
  }

  toggleTodo(id: number) {
    this.todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  deleteTodo(id: number) {
    this.todos.update(todos => todos.filter(t => t.id !== id));
    if (this.editingId() === id) this.editingId.set(null);
  }

  startEdit(todo: Todo) {
    this.editingId.set(todo.id);
    this.editingText = todo.text;
    setTimeout(() => {
      const input = document.getElementById(`edit-${todo.id}`) as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 50);
  }

  saveEdit(id: number) {
    const text = this.editingText.trim();
    if (text) {
      this.todos.update(todos =>
        todos.map(t => t.id === id ? { ...t, text } : t)
      );
    }
    this.editingId.set(null);
    this.editingText = '';
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editingText = '';
  }

  setFilter(filter: FilterType) {
    this.currentFilter.set(filter);
  }

  clearCompleted() {
    this.todos.update(todos => todos.filter(t => !t.completed));
  }

  toggleAll() {
    const hasActive = this.activeTodosCount() > 0;
    this.todos.update(todos =>
      todos.map(t => ({ ...t, completed: hasActive }))
    );
  }
}
