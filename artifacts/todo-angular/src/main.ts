import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// ConfirmationService e MessageService são registrados no nível da aplicação
// para que todos os componentes roteados possam injetá-los diretamente.
bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    ConfirmationService,
    MessageService,
  ],
}).catch(err => console.error(err));
