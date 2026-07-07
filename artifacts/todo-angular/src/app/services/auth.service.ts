import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

const TOKEN_KEY = 'todo_jwt';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );

  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

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
    // Calls backend auth API and stores JWT in local storage on success.
    return this.http
      .post<{ token: string }>('/api/auth/login', { username, password })
      .pipe(
        tap((res) => {
          this._token.set(res.token);
          localStorage.setItem(TOKEN_KEY, res.token);
        }),
        map(() => void 0),
        catchError((err) => { throw err; }),
      );
  }

  logout(): void {
    // Clears stored JWT and redirects the user to the login screen.
    this._token.set(null);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
