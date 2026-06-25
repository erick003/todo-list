import { Routes } from '@angular/router';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoDetailComponent } from './todo-detail/todo-detail.component';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',              redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',         component: LoginComponent },
  { path: 'todos',         component: TodoListComponent,   canActivate: [authGuard] },
  { path: 'todos/new',     component: TodoFormComponent,   canActivate: [authGuard] },
  { path: 'todos/:id',     component: TodoDetailComponent, canActivate: [authGuard] },
  { path: 'todos/:id/edit',component: TodoFormComponent,   canActivate: [authGuard] },
];