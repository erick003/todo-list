import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// provideHttpClient() — habilita HttpClient para injeção em serviços e componentes.
// withInterceptors() registra o interceptor que adiciona o JWT em todas as requisições HTTP.
// ConfirmationService e MessageService no nível da aplicação para todos os roteados.
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    ConfirmationService,
    MessageService,
  ],
}).catch(err => console.error(err));
