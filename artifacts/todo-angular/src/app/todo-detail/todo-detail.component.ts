/**
 * TodoDetailComponent — operação DETALHAR (rota: /todos/:id)
 *
 * Requisito: "LISTAGEM envie informação na ativação da rota de DETALHE e
 * este componente utilize essa mesma informação na nova rota ativada."
 *
 * Leitura dos dados recebidos da lista:
 *   1. history.state.todo — objeto Todo passado pelo TodoListComponent via
 *      router.navigate(['/todos', id], { state: { todo } }).
 *      Disponível sem precisar buscar no service — é a informação enviada
 *      pela lista no momento da navegação.
 *   2. Fallback: todoService.getById(id) — usado quando o usuário acessa
 *      a URL diretamente (sem passar pela lista).
 *
 * Este componente não usa mais p-dialog nem model() — é uma página completa.
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Todo } from '../models';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, TagModule, DividerModule],
  templateUrl: './todo-detail.component.html',
})
export class TodoDetailComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private todoService  = inject(TodoService);

  // Signal local que armazena o todo a ser exibido.
  todo = signal<Todo | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Requisito: usa a informação enviada pela lista via Navigation State.
    // history.state é preenchido pelo Angular quando router.navigate é chamado
    // com a opção { state: { todo } } no TodoListComponent.
    const stateData = history.state as { todo?: Todo };
    this.todo.set(stateData.todo ?? this.todoService.getById(id) ?? null);
  }

  /** Navega de volta para a listagem. */
  goBack(): void {
    this.router.navigate(['/todos']);
  }

  /**
   * Navega para a rota de edição, passando o todo atual via state.
   * Encadeia a passagem de dados: lista → detalhe → edição.
   */
  goToEdit(): void {
    const t = this.todo();
    if (t) {
      // Obtém a versão mais recente do service antes de abrir o formulário.
      const fresh = this.todoService.getById(t.id) ?? t;
      this.router.navigate(['/todos', fresh.id, 'edit'], { state: { todo: fresh } });
    }
  }

  // ── Helpers de exibição ───────────────────────────────────────────────────
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
