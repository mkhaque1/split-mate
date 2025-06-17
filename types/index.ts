export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  currency: string;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidBy: string;
  splitBetween: string[];
  description?: string;
  date: Date;
  createdAt: Date;
  receipt?: string;
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'rent'
  | 'other';

export interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed';
  method?: 'paypal' | 'venmo' | 'revolut' | 'cash';
  createdAt: Date;
  completedAt?: Date;
}

export interface Balance {
  userId: string;
  amount: number;
  currency: string;
}
