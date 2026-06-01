/**
 * TodoFormComponent — operações INCLUIR e ALTERAR
 *
 * Requisito atendido: componente único que centraliza os dois casos de
 * escrita (criação e edição), diferenciados pelo input `mode`.
 *
 * COMUNICAÇÃO COM O PAI (AppComponent):
 *
 *   model()  — binding BIDIRECIONAL para visibilidade do dialog:
 *     • visible : boolean
 *       - O pai abre (true) e o componente fecha (false) ao salvar/cancelar.
 *       - No template do pai: [(visible)]="showFormDialog"
 *
 *   input()  — dados somente-leitura recebidos do pai:
 *     • mode       : 'add' | 'edit'  — determina o título e o comportamento
 *     • editTarget : Todo | null     — tarefa a editar (null = nova tarefa)
 *
 *   output() — evento emitido ao confirmar o formulário:
 *     • save : TodoFormData — pai persiste os dados e atualiza o signal todos
 *
 * SIGNAL FORMS (formulário reativo com signals puros):
 *   Em vez de ReactiveFormsModule (FormGroup / FormControl), cada campo
 *   do formulário é um signal() independente. A validação é feita com
 *   computed(), que recalcula os erros sempre que o campo muda.
 *   Isso elimina a dependência do módulo de formulários para lógica
 *   de validação e mantém tudo tipado e reativo.
 */

import { Component, input, output, model, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { Todo, TodoFormData } from '../models';

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
  // ── model() — binding bidirecional ────────────────────────────────────────
  // Mesmo padrão do TodoDetailComponent: pai e filho compartilham o estado
  // de abertura/fechamento do dialog sem eventos separados.
  visible = model(false);

  // ── input() — configuração recebida do pai ────────────────────────────────
  mode       = input<'add' | 'edit'>('add');
  editTarget = input<Todo | null>(null);

  // ── output() — evento de saída com os dados do formulário ─────────────────
  save = output<TodoFormData>();

  // ── Signal Form — campos do formulário como signals ───────────────────────
  // Cada campo é um signal<T> inicializado com seu valor padrão.
  // A binding no template usa [(ngModel)] para two-way com FormsModule,
  // mas o estado "verdadeiro" é sempre o signal (não o ngModel interno).
  formText        = signal('');
  formDescription = signal('');
  formPriority    = signal<number>(2);
  formCompleted   = signal(false);

  // ── Signal Form — estado "touched" (campo foi interagido pelo usuário) ─────
  // Erros só são exibidos após o usuário tocar o campo ou tentar salvar,
  // evitando mensagens de erro prematuras ao abrir o formulário.
  textTouched        = signal(false);
  descriptionTouched = signal(false);
  priorityTouched    = signal(false);

  // ── Signal Form — validação reativa com computed() ────────────────────────
  // computed<string | null>() recalcula o erro sempre que o signal do campo
  // muda. Retorna a mensagem de erro ou null (sem erro).
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

  // computed() que agrega todos os erros — usado para desabilitar o botão Salvar.
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

  // ── effect() — preenche/limpa o formulário ao abrir o dialog ──────────────
  // effect() é executado toda vez que qualquer signal lido dentro dele muda.
  // Aqui, observa `visible`: ao abrir (true), popula com os dados de edição
  // ou limpa para um novo cadastro. Também reseta os estados "touched".
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
    // Marca todos os campos como tocados para exibir erros antes de enviar.
    this.textTouched.set(true);
    this.descriptionTouched.set(true);
    this.priorityTouched.set(true);
    if (!this.isFormValid()) return;

    // Emite o output() save com os dados validados para o pai persistir.
    this.save.emit({
      text:        this.formText().trim(),
      description: this.formDescription().trim(),
      priority:    this.formPriority(),
      completed:   this.formCompleted(),
    });
    this.visible.set(false);  // fecha o dialog via model()
  }

  onCancel() {
    this.visible.set(false);
  }
}
