export interface Todo {
  id: number;
  text: string;
  description: string;
  priority: number;
  completed: boolean;
  createdAt: Date;
}

export type FilterType = 'all' | 'active' | 'completed';

export interface TodoFormData {
  text: string;
  description: string;
  priority: number;
  completed: boolean;
}
