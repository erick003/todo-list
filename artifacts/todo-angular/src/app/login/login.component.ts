import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  template: `
    <p-toast position="top-right" />

    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <i class="pi pi-lock text-indigo-600 text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Entrar</h1>
          <p class="text-gray-500 text-sm mt-1">Acesse o gerenciador de tarefas</p>
        </div>

        <form (ngSubmit)="onSubmit()" novalidate>
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i class="pi pi-user"></i>
              </span>
              <input
                type="text"
                [value]="username()"
                (input)="onUsernameInput($event)"
                (blur)="usernameTouched.set(true)"
                placeholder="Digite seu usuário"
                autocomplete="username"
                class="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-indigo-400"
                [class.border-red-400]="usernameTouched() && usernameError()"
                [class.border-gray-300]="!(usernameTouched() && usernameError())"
              />
            </div>
            <p *ngIf="usernameTouched() && usernameError()" class="text-red-500 text-xs mt-1">
              {{ usernameError() }}
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i class="pi pi-lock"></i>
              </span>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [value]="password()"
                (input)="onPasswordInput($event)"
                (blur)="passwordTouched.set(true)"
                placeholder="Digite sua senha"
                autocomplete="current-password"
                class="w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-indigo-400"
                [class.border-red-400]="passwordTouched() && passwordError()"
                [class.border-gray-300]="!(passwordTouched() && passwordError())"
              />
              <button
                type="button"
                (click)="toggleShowPassword()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i [class]="showPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
            <p *ngIf="passwordTouched() && passwordError()" class="text-red-500 text-xs mt-1">
              {{ passwordError() }}
            </p>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-2.5 rounded-lg font-semibold text-sm transition bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <span *ngIf="loading(); else loginLabel">
              <i class="pi pi-spin pi-spinner mr-2"></i> Entrando...
            </span>
            <ng-template #loginLabel>
              <i class="pi pi-sign-in mr-2"></i> Entrar
            </ng-template>
          </button>
        </form>

      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastSvc = inject(MessageService);

  username = signal('');
  password = signal('');
  usernameTouched = signal(false);
  passwordTouched = signal(false);
  showPassword = signal(false);
  loading = signal(false);

  usernameError = computed<string | null>(() => {
    const v = this.username().trim();
    if (!v) return 'O usuário é obrigatório.';
    return null;
  });

  passwordError = computed<string | null>(() => {
    const v = this.password();
    if (!v) return 'A senha é obrigatória.';
    if (v.length < 4) return 'Mínimo 4 caracteres.';
    return null;
  });

  isFormValid = computed(
    () => this.usernameError() === null && this.passwordError() === null,
  );

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/todos']);
    }
  }

  onUsernameInput(event: Event): void {
    this.username.set((event.target as HTMLInputElement).value);
  }

  onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.usernameTouched.set(true);
    this.passwordTouched.set(true);
    if (!this.isFormValid()) return;
    this.loading.set(true);
    this.auth.login(this.username().trim(), this.password()).subscribe({
      next: () => this.router.navigate(['/todos']),
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Usuário ou senha inválidos.';
        this.toastSvc.add({ severity: 'error', summary: 'Falha no login', detail: msg, life: 4000 });
      },
    });
  }
}
