/**
 * AppComponent — COMPONENTE COORDENADOR
 *
 * Requisito atendido: "Refatore em componentes distintos as operações
 * detalhar, listar, incluir e alterar de cada modelo."
 *
 * Este componente NÃO realiza nenhuma operação CRUD diretamente na view.
 * Ele é o ponto central de estado da aplicação e delega cada operação
 * para um componente filho especializado:
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  AppComponent  (estado global + handlers CRUD)                  │
 *   │                                                                  │
 *   │  ├─ TodoListComponent    → operação LISTAR                      │
 *   │  ├─ TodoFormComponent    → operações INCLUIR e ALTERAR          │
 *   │  └─ TodoDetailComponent  → operação DETALHAR                    │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * COMUNICAÇÃO (input / output / model):
 *   • Passa dados PARA os filhos via [input()]  — ex.: [todos], [filter]
 *   • Recebe eventos DOS filhos via (output())  — ex.: (save), (remove)
 *   • Controla visibilidade dos dialogs via [(model())] — two-way binding
 *     bidirecional sem necessidade de @Input/@Output separados.
 */

import { Component, signal, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Todo, FilterType, TodoFormData } from './models';
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

  // ── Estado global gerenciado com signal() ─────────────────────────────────
  // signal() cria um valor reativo: qualquer alteração via .set() ou .update()
  // propaga automaticamente para todos os componentes que dependem dele.
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

  // Sinais de controle de UI — controlam qual dialog está visível e qual
  // tarefa está selecionada para edição/detalhe.
  currentFilter    = signal<FilterType>('all');
  showFormDialog   = signal(false);
  showDetailDialog = signal(false);
  dialogMode       = signal<'add' | 'edit'>('add');
  editTarget       = signal<Todo | null>(null);
  selectedTodo     = signal<Todo | null>(null);

  // ── Coordenação dos dialogs ───────────────────────────────────────────────
  // Esses métodos são chamados quando um componente filho emite um output().

  /** Abre o TodoFormComponent no modo INCLUIR. */
  openAdd() {
    this.editTarget.set(null);
    this.dialogMode.set('add');
    this.showFormDialog.set(true);
  }

  /** Abre o TodoFormComponent no modo ALTERAR com os dados da tarefa. */
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

  // ── Handlers CRUD ─────────────────────────────────────────────────────────
  // Cada método abaixo é conectado a um output() de um componente filho
  // no template (app.component.html) usando a sintaxe (evento)="handler($event)".

  /** Alterna o campo `completed` da tarefa — chamado pelo output toggle do TodoListComponent. */
  handleToggle(id: number) {
    this.todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  /**
   * Persiste a tarefa — chamado pelo output save do TodoFormComponent.
   * Se mode === 'add': cria um novo Todo com id e createdAt gerados aqui.
   * Se mode === 'edit': mescla os dados no item existente via spread operator.
   */
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

  /** Remove a tarefa após confirmação — chamado pelo output remove do TodoListComponent. */
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
