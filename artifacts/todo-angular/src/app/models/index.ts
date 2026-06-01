/**
 * MODELO DE DADOS — Todo
 *
 * Requisito: "Seu modelo deve ter pelo menos 3 atributos: string, número e booleano"
 *
 * Atributos obrigatórios (e seus tipos primitivos):
 *   • text        → string   (título da tarefa)
 *   • description → string   (detalhamento opcional)
 *   • priority    → number   (1 = Baixa, 2 = Média, 3 = Alta)
 *   • id          → number   (identificador único auto-incrementado)
 *   • completed   → boolean  (indica se a tarefa foi concluída)
 *   • createdAt   → Date     (data/hora de criação)
 */
export interface Todo {
  id: number;
  text: string;
  description: string;
  priority: number;
  completed: boolean;
  createdAt: Date;
}

/**
 * Tipo auxiliar para o filtro de exibição da lista.
 * Utilizado como input() no TodoListComponent.
 */
export type FilterType = 'all' | 'active' | 'completed';

/**
 * Payload emitido pelo formulário (incluir/alterar) via output().
 * Exclui id e createdAt, que são gerados pelo AppComponent.
 */
export interface TodoFormData {
  text: string;
  description: string;
  priority: number;
  completed: boolean;
}
