/**
 * TodoFormComponent — operações INSERIR e ATUALIZAR
 *
 * Uso do service: injeta TodoService e persiste os dados diretamente
 * em onSave(), antes de emitir o output() save.
 *   • modo 'add'  → todoService.add(data)
 *   • modo 'edit' → todoService.update(editTarget.id, data)
 *
 * O output() save continua existindo, mas agora serve apenas para
 * notificar o AppComponent que uma operação ocorreu (para exibir o toast).
 * A persistência em si já foi feita aqui, no componente de formulário.
 *
 * COMUNICAÇÃO COM O AppComponent:
 *   model()  ↔ visible    — two-way binding para abrir/fechar o dialog
 *   input()  ← mode       — 'add' ou 'edit'
 *   input()  ← editTarget — tarefa a editar (null para nova tarefa)
 *   output() → save       — notifica o pai após persistir (para toast)
 */

import { Component, input, output, model, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { Todo, TodoFormData } from '../models';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CheckboxModule,
  ],
  templateUrl: './todo-form.component.html',
})
export class TodoFormComponent {
  // Service injetado — realiza a persistência (inserir/atualizar).
  private todoService = inject(TodoService);

  // ── model() — two-way binding de visibilidade ─────────────────────────────
  visible = model(false);

  // ── input() — configuração recebida do pai ────────────────────────────────
  mode       = input<'add' | 'edit'>('add');
  editTarget = input<Todo | null>(null);

  // ── output() — notificação pós-persistência (apenas para toast no pai) ────
  save = output<TodoFormData>();

  // ── Signal Form — campos como signals ────────────────────────────────────
  formText        = signal('');
  formDescription = signal('');
  formPriority    = signal<number>(2);
  formCompleted   = signal(false);

  // ── Signal Form — estado touched ─────────────────────────────────────────
  textTouched        = signal(false);
  descriptionTouched = signal(false);
  priorityTouched    = signal(false);

  // ── Signal Form — validação com computed() ────────────────────────────────
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
    if (!v) return 'Selecione uma prioridade.';
    return null;
  });

  isFormValid = computed(() =>
    this.textError()        === null &&
    this.descriptionError() === null &&
    this.priorityError()    === null
  );

  priorityOptions = [
    { label: 'Baixa', value: 1 },
    { label: 'Média', value: 2 },
    { label: 'Alta',  value: 3 },
  ];

  // ── effect() — preenche/limpa o formulário ao abrir ───────────────────────
  constructor() {
    effect(() => {
      if (this.visible()) {
        const target = this.editTarget();
        this.formText.set(target?.text        ?? '');
        this.formDescription.set(target?.description ?? '');
        this.formPriority.set(target?.priority    ?? 2);
        this.formCompleted.set(target?.completed   ?? false);
        this.textTouched.set(false);
        this.descriptionTouched.set(false);
        this.priorityTouched.set(false);
      }
    }, { allowSignalWrites: true });
  }

  // ── Ações ─────────────────────────────────────────────────────────────────
  onSave() {
    this.textTouched.set(true);
    this.descriptionTouched.set(true);
    this.priorityTouched.set(true);
    if (!this.isFormValid()) return;

    const data: TodoFormData = {
      text:        this.formText().trim(),
      description: this.formDescription().trim(),
      priority:    this.formPriority(),
      completed:   this.formCompleted(),
    };

    // Persiste via service antes de notificar o pai.
    if (this.mode() === 'add') {
      this.todoService.add(data);                          // ← INSERIR
    } else {
      const id = this.editTarget()?.id;
      if (id != null) this.todoService.update(id, data);  // ← ATUALIZAR
    }

    this.save.emit(data);    // notifica o pai apenas para exibir o toast
    this.visible.set(false);
  }

  onCancel() {
    this.visible.set(false);
  }
}
