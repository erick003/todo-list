import { Component, input, output, model, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { Todo, TodoFormData } from '../models/todo.model';

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
  // ── Inputs / model ────────────────────────────────────────────────────────
  visible    = model(false);
  mode       = input<'add' | 'edit'>('add');
  editTarget = input<Todo | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────────
  save = output<TodoFormData>();

  // ── Signal Form — field values ────────────────────────────────────────────
  formText        = signal('');
  formDescription = signal('');
  formPriority    = signal<number>(2);
  formCompleted   = signal(false);

  // ── Signal Form — touched state ───────────────────────────────────────────
  textTouched        = signal(false);
  descriptionTouched = signal(false);
  priorityTouched    = signal(false);

  // ── Signal Form — computed validation errors (null = valid) ───────────────
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

  // ── Populate / reset form when dialog opens ───────────────────────────────
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

  // ── Actions ───────────────────────────────────────────────────────────────
  onSave() {
    this.textTouched.set(true);
    this.descriptionTouched.set(true);
    this.priorityTouched.set(true);
    if (!this.isFormValid()) return;

    this.save.emit({
      text:        this.formText().trim(),
      description: this.formDescription().trim(),
      priority:    this.formPriority(),
      completed:   this.formCompleted(),
    });
    this.visible.set(false);
  }

  onCancel() {
    this.visible.set(false);
  }
}
