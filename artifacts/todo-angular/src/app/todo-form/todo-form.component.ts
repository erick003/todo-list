/**
 * TodoFormComponent — operações INCLUIR e ATUALIZAR
 *
 * Rotas:
 *   /todos/new        → mode 'add'  (sem parâmetro :id)
 *   /todos/:id/edit   → mode 'edit' (com parâmetro :id)
 *
 * Requisito: "LISTAGEM envie informação na ativação da rota de ATUALIZAÇÃO
 * e este componente utilize essa mesma informação na nova rota ativada."
 *
 * Leitura dos dados recebidos da lista (modo edição):
 *   1. history.state.todo — objeto Todo passado pelo TodoListComponent (ou
 *      TodoDetailComponent) via router.navigate([...], { state: { todo } }).
 *   2. Fallback: todoService.getById(id) — para acesso direto pela URL.
 *
 * O modo (add/edit) é determinado pela presença do parâmetro :id na rota,
 * eliminando a necessidade de input() para receber o modo do pai.
 *
 * Este componente não usa mais p-dialog nem model() — é uma página completa.
 * O formulário é populado em ngOnInit() em vez de effect().
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

  // Modo determinado pela rota em ngOnInit (não vem mais de input()).
  mode       = signal<'add' | 'edit'>('add');
  editTarget = signal<Todo | null>(null);

  // ── Signal Form — campos ──────────────────────────────────────────────────
  formText        = signal('');
  formDescription = signal('');
  formPriority    = signal<number>(2);
  formCompleted   = signal(false);

  // ── Signal Form — touched ─────────────────────────────────────────────────
  textTouched        = signal(false);
  descriptionTouched = signal(false);
  priorityTouched    = signal(false);

  // ── Signal Form — validação ───────────────────────────────────────────────
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
      // Modo ATUALIZAR: URL possui :id → /todos/:id/edit
      this.mode.set('edit');

      // Requisito: lê o todo enviado pela lista via Navigation State.
      // history.state é preenchido pelo router.navigate(..., { state: { todo } })
      // chamado em TodoListComponent.goToEdit() ou TodoDetailComponent.goToEdit().
      const stateData = history.state as { todo?: Todo };
      const target = stateData.todo ?? this.todoService.getById(Number(id)) ?? null;
      this.editTarget.set(target);

      // Preenche o formulário com os dados recebidos.
      if (target) {
        this.formText.set(target.text);
        this.formDescription.set(target.description);
        this.formPriority.set(target.priority);
        this.formCompleted.set(target.completed);
      }
    }
    // Modo INCLUIR: URL é /todos/new → campos permanecem com valores padrão.
  }

  // ── Ações ─────────────────────────────────────────────────────────────────
  onSave(): void {
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

    if (this.mode() === 'add') {
      this.todoService.add(data);                                         // INSERIR
      this.messageService.add({
        severity: 'success', summary: 'Tarefa adicionada',
        detail: `"${data.text}" foi criada com sucesso.`, life: 3000,
      });
    } else {
      const id = this.editTarget()?.id;
      if (id != null) this.todoService.update(id, data);                 // ATUALIZAR
      this.messageService.add({
        severity: 'info', summary: 'Tarefa atualizada',
        detail: `"${data.text}" foi atualizada.`, life: 3000,
      });
    }

    this.router.navigate(['/todos']);  // retorna à lista após salvar
  }

  onCancel(): void {
    this.router.navigate(['/todos']);
  }
}
