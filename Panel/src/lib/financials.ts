export type Transaction = {
  id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string; // ISO-like date
  status: 'completed' | 'pending';
};

export type TransactionFilters = {
  type?: 'all' | 'income' | 'expense';
  status?: 'all' | 'completed' | 'pending';
};

export type TransactionSort = {
  key: 'date' | 'amount';
  dir: 'asc' | 'desc';
};

export function filterAndSortTransactions(
  items: Transaction[],
  filters: TransactionFilters,
  sort: TransactionSort
): Transaction[] {
  const typeFilter = filters.type ?? 'all';
  const statusFilter = filters.status ?? 'all';
  let arr = [...items];
  if (typeFilter !== 'all') arr = arr.filter(t => t.type === typeFilter);
  if (statusFilter !== 'all') arr = arr.filter(t => t.status === statusFilter);
  arr.sort((a, b) => {
    if (sort.key === 'date') {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sort.dir === 'asc' ? da - db : db - da;
    }
    return sort.dir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
  });
  return arr;
}
