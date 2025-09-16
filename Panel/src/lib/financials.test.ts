import { describe, it, expect } from 'vitest';
import { filterAndSortTransactions, Transaction } from './financials';

const sample: Transaction[] = [
  { id: 1, type: 'income', description: 'A', amount: 100, date: '2024-01-10', status: 'completed' },
  { id: 2, type: 'expense', description: 'B', amount: 50, date: '2024-01-11', status: 'pending' },
  { id: 3, type: 'income', description: 'C', amount: 500, date: '2024-01-09', status: 'pending' },
];

describe('filterAndSortTransactions', () => {
  it('filters by type and status', () => {
    const res = filterAndSortTransactions(sample, { type: 'income', status: 'pending' }, { key: 'date', dir: 'asc' });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(3);
  });

  it('sorts by amount desc', () => {
    const res = filterAndSortTransactions(sample, { type: 'all', status: 'all' }, { key: 'amount', dir: 'desc' });
    expect(res[0].amount).toBe(500);
    expect(res[2].amount).toBe(50);
  });
});
