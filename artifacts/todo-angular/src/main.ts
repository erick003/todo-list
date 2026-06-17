import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// provideHttpClient() — habilita HttpClient para injeção em serviços e componentes.
// ConfirmationService e MessageService no nível da aplicação para todos os roteados.
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(),
    ConfirmationService,
    MessageService,
  ],
}).catch(err => console.error(err));
