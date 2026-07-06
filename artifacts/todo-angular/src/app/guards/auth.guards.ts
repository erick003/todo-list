/**
 * AuthService — gerencia autenticação JWT no frontend.
 *
 * • login()  → POST /api/auth/login, guarda token no localStorage e no signal.
 * • logout() → remove o token.
 * • token    → signal<string|null> com o token atual (readonly).
 * • isAuthenticated → computed() que retorna true quando há token.
 *
 * O AuthInterceptor lê token() para adicionar o header Authorization
 * em todas as requisições HTTP.
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';

const TOKEN_KEY = 'todo_jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );

  /** Token atual (null = não autenticado). */
  readonly token = this._token.asReadonly();

  /** true quando há token armazenado. */
  readonly isAuthenticated = computed(() => this._token() !== null);

  /** Usuário decodificado do payload JWT (sem verificação de assinatura — apenas leitura). */
  readonly currentUser = computed<string | null>(() => {
    const t = this._token();
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]!)) as { username?: string };
      return payload.username ?? null;
    } catch {
      return null;
    }
  });

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<{ token: string }>('/api/auth/login', { username, password })
      .pipe(
        tap(res => {
          this._token.set(res.token);
          localStorage.setItem(TOKEN_KEY, res.token);
        }),
        map(() => void 0),
      );
  }

  logout(): void {
    this._token.set(null);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
