/**
 * TodoDetailComponent — operação DETALHAR (rota: /todos/:id)
 *
 * Leitura dos dados (prioridade):
 *   1. history.state.todo — objeto passado pela lista via Navigation State
 *      (router.navigate com { state: { todo } }). Uso imediato, sem HTTP.
 *   2. Fallback HTTP: GET /api/todos/:id — quando o usuário acessa a URL
 *      diretamente ou recarrega a página (history.state fica vazio).
 *
 * goToEdit() também passa o todo via state para o formulário de edição,
 * encadeando a passagem de dados: lista → detalhe → edição.
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Todo } from '../models';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, DividerModule, ProgressSpinnerModule],
  templateUrl: './todo-detail.component.html',
})
export class TodoDetailComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private todoService  = inject(TodoService);

  todo         = signal<Todo | null>(null);
  loadingById  = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // 1. Tenta usar o dado enviado pela lista via Navigation State.
    const stateData = history.state as { todo?: Todo };
    if (stateData.todo) {
      this.todo.set(stateData.todo);
      return;
    }

    // 2. Fallback: GET /api/todos/:id (acesso direto pela URL).
    this.loadingById.set(true);
    this.todoService.getById(id).subscribe({
      next: t  => { this.todo.set(t);    this.loadingById.set(false); },
      error: () => { this.todo.set(null); this.loadingById.set(false); },
    });
  }

  goBack(): void {
    this.router.navigate(['/todos']);
  }

  /** Navega para edição passando o todo atual via state. */
  goToEdit(): void {
    const t = this.todo();
    if (t) {
      this.router.navigate(['/todos', t.id, 'edit'], { state: { todo: t } });
    }
  }

  getPriorityLabel(priority: number): string {
    return (['', 'Baixa', 'Média', 'Alta'])[priority] ?? 'Baixa';
  }

  getPrioritySeverity(priority: number): 'success' | 'warning' | 'danger' {
    const map: Record<number, 'success' | 'warning' | 'danger'> = {
      1: 'success', 2: 'warning', 3: 'danger',
    };
    return map[priority] ?? 'success';
  }
}
