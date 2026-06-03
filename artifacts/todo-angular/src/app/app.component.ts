/**
 * AppComponent — casca da aplicação.
 *
 * Com a introdução do roteador, este componente tornou-se mínimo:
 * apenas renderiza o <router-outlet> (ponto de montagem das rotas)
 * e mantém <p-toast> e <p-confirmDialog> disponíveis globalmente.
 *
 * Toda a coordenação de navegação e CRUD migrou para os próprios
 * componentes roteados, que injetam Router e TodoService diretamente.
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}
