import { Balance, Expense, User } from '@/types';

export class CalculationService {
  static calculateGroupBalances(
    expenses: Expense[],
    members: User[]
  ): Balance[] {
    const balances: { [userId: string]: number } = {};

    // Initialize balances
    members.forEach((member) => {
      balances[member.id] = 0;
    });

    expenses.forEach((expense) => {
      const splitAmount = expense.amount / expense.splitBetween.length;

      // Add to payer's balance
      balances[expense.paidBy] += expense.amount;

      // Subtract split amount from each person
      expense.splitBetween.forEach((userId) => {
        balances[userId] -= splitAmount;
      });
    });

    return Object.entries(balances).map(([userId, amount]) => ({
      userId,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      currency: expenses[0]?.currency || 'USD',
    }));
  }

  static calculateSettlements(
    balances: Balance[]
  ): Array<{ from: string; to: string; amount: number }> {
    const debtors = balances
      .filter((b) => b.amount < 0)
      .map((b) => ({ ...b, amount: Math.abs(b.amount) }));
    const creditors = balances.filter((b) => b.amount > 0);
    const settlements: Array<{ from: string; to: string; amount: number }> = [];

    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debt = debtors[i];
      const credit = creditors[j];

      const settlementAmount = Math.min(debt.amount, credit.amount);

      if (settlementAmount > 0.01) {
        // Only create settlements for amounts > 1 cent
        settlements.push({
          from: debt.userId,
          to: credit.userId,
          amount: Math.round(settlementAmount * 100) / 100,
        });
      }

      debt.amount -= settlementAmount;
      credit.amount -= settlementAmount;

      if (debt.amount < 0.01) i++;
      if (credit.amount < 0.01) j++;
    }

    return settlements;
  }

  static getExpensesByCategory(expenses: Expense[]): {
    [category: string]: number;
  } {
    const categoryTotals: { [category: string]: number } = {};

    expenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return categoryTotals;
  }

  static getMonthlyTotals(expenses: Expense[]): { [month: string]: number } {
    const monthlyTotals: { [month: string]: number } = {};

    expenses.forEach((expense) => {
      const monthKey = expense.date.toISOString().substring(0, 7); // YYYY-MM format
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    return monthlyTotals;
  }

  static getTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  static getUserExpenseTotal(expenses: Expense[], userId: string): number {
    return expenses
      .filter((expense) => expense.paidBy === userId)
      .reduce((total, expense) => total + expense.amount, 0);
  }

  static getUserOwedAmount(expenses: Expense[], userId: string): number {
    let totalOwed = 0;

    expenses.forEach((expense) => {
      if (expense.splitBetween.includes(userId)) {
        const splitAmount = expense.amount / expense.splitBetween.length;
        totalOwed += splitAmount;
      }
    });

    return Math.round(totalOwed * 100) / 100;
  }
}
