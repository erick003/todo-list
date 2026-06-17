/**
 * TodoFormComponent — operações INCLUIR e ATUALIZAR
 *
 * Rotas:
 *   /todos/new        → mode 'add'  (POST /api/todos)
 *   /todos/:id/edit   → mode 'edit' (PUT  /api/todos/:id)
 *
 * Leitura dos dados no modo edição:
 *   1. history.state.todo — passado pela lista/detalhe via Navigation State.
 *   2. Fallback HTTP: GET /api/todos/:id — acesso direto pela URL.
 *
 * onSave():
 *   Assina o Observable retornado por todoService.add() ou todoService.update().
 *   O HttpClient efetua a chamada HTTP apenas quando há um subscriber.
 *   Após a resposta, exibe toast e navega de volta para /todos.
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { Todo, TodoFormData } from '../models';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CheckboxModule,
  ],
  templateUrl: './todo-form.component.html',
})
export class TodoFormComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private todoService    = inject(TodoService);
  private messageService = inject(MessageService);

  mode       = signal<'add' | 'edit'>('add');
  editTarget = signal<Todo | null>(null);
  saving     = signal(false);

  // ── Signal Form ───────────────────────────────────────────────────────────
  formText        = signal('');
  formDescription = signal('');
  formPriority    = signal<number>(2);
  formCompleted   = signal(false);

  textTouched        = signal(false);
  descriptionTouched = signal(false);
  priorityTouched    = signal(false);

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
    if (!this.formPriority()) return 'Selecione uma prioridade.';
    return null;
  });

  isFormValid = computed(() =>
    this.textError() === null &&
    this.descriptionError() === null &&
    this.priorityError() === null
  );

  priorityOptions = [
    { label: 'Baixa', value: 1 },
    { label: 'Média', value: 2 },
    { label: 'Alta',  value: 3 },
  ];

  // ── Inicialização via rota ────────────────────────────────────────────────
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.mode.set('edit');

      // 1. Dado enviado pela lista/detalhe via Navigation State.
      const stateData = history.state as { todo?: Todo };
      if (stateData.todo) {
        this.editTarget.set(stateData.todo);
        this.populate(stateData.todo);
        return;
      }

      // 2. Fallback HTTP: GET /api/todos/:id.
      this.todoService.getById(Number(id)).subscribe({
        next: t  => { this.editTarget.set(t); this.populate(t); },
        error: () => {},
      });
    }
  }

  private populate(t: Todo): void {
    this.formText.set(t.text);
    this.formDescription.set(t.description);
    this.formPriority.set(t.priority);
    this.formCompleted.set(t.completed);
  }

  // ── Ações ─────────────────────────────────────────────────────────────────
  onSave(): void {
    this.textTouched.set(true);
    this.descriptionTouched.set(true);
    this.priorityTouched.set(true);
    if (!this.isFormValid() || this.saving()) return;

    const data: TodoFormData = {
      text:        this.formText().trim(),
      description: this.formDescription().trim(),
      priority:    this.formPriority(),
      completed:   this.formCompleted(),
    };

    this.saving.set(true);

    if (this.mode() === 'add') {
      // POST /api/todos
      this.todoService.add(data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success', summary: 'Tarefa adicionada',
            detail: `"${data.text}" foi criada com sucesso.`, life: 3000,
          });
          this.router.navigate(['/todos']);
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar a tarefa.', life: 3000,
          });
        },
      });
    } else {
      const id = this.editTarget()?.id;
      if (id == null) return;

      // PUT /api/todos/:id
      this.todoService.update(id, data).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'info', summary: 'Tarefa atualizada',
            detail: `"${data.text}" foi atualizada.`, life: 3000,
          });
          this.router.navigate(['/todos']);
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar a tarefa.', life: 3000,
          });
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/todos']);
  }
}
