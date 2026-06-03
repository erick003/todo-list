/**
 * Definição das rotas da aplicação.
 *
 * Requisito: "Crie rotas distintas para acessar distintos componentes de
 * Listagem, Detalhe, Inclusão e Atualização."
 *
 *   /todos           → TodoListComponent   (LISTAR)
 *   /todos/new       → TodoFormComponent   (INCLUIR)
 *   /todos/:id       → TodoDetailComponent (DETALHAR)
 *   /todos/:id/edit  → TodoFormComponent   (ATUALIZAR)
 *
 * IMPORTANTE: '/todos/new' deve vir ANTES de '/todos/:id' para que a
 * palavra "new" não seja capturada como um parâmetro de id.
 *
 * Passagem de dados (requisito "LISTAGEM envie informação na ativação"):
 *   O TodoListComponent navega usando router.navigate([...], { state: { todo } }).
 *   O Angular repassa o objeto via History API (history.state).
 *   Os componentes de DETALHE e ATUALIZAÇÃO leem history.state.todo e,
 *   como fallback (acesso direto pela URL), buscam no TodoService.getById(id).
 */

import { Routes } from '@angular/router';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoDetailComponent } from './todo-detail/todo-detail.component';
import { TodoFormComponent } from './todo-form/todo-form.component';

export const routes: Routes = [
  { path: '',              redirectTo: 'todos', pathMatch: 'full' },
  { path: 'todos',         component: TodoListComponent   },
  { path: 'todos/new',     component: TodoFormComponent   },
  { path: 'todos/:id',     component: TodoDetailComponent },
  { path: 'todos/:id/edit',component: TodoFormComponent   },
];
