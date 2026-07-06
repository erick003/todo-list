import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'todo-angular-auth';

  login(username: string, password: string): Observable<boolean> {
    const isValid =
      (username === 'admin' && password === 'admin123') ||
      (username === 'user' && password === 'user123');

    if (!isValid) {
      return throwError(() => ({ error: { message: 'Usuário ou senha inválidos.' } }));
    }

    return of(true).pipe(
      delay(500),
      tap(() => {
        localStorage.setItem(this.storageKey, 'true');
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.storageKey) === 'true';
  }
}
