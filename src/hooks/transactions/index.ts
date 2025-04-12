
import { useFetchTransactions } from './useFetchTransactions';
import { useAddTransaction } from './useAddTransaction';
import { useAdminTransactions } from './useAdminTransactions';
import { Transaction } from '@/utils/transactionService';

interface UseTransactionsOptions {
  userId?: string;
  type?: "send" | "airtime" | "data";
  recentDays?: number;
  refreshInterval?: number;
  isAdmin?: boolean;
}

// Main hook that combines the functionality of all the other hooks
export function useTransactions(options: UseTransactionsOptions = {}) {
  const { transactions, isLoading, refreshTransactions } = useFetchTransactions(options);
  const { addTransaction } = useAddTransaction();
  const { updateTransaction, deleteTransaction } = useAdminTransactions(options);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
  };
}

// Export individual hooks for more granular usage
export { useFetchTransactions, useAddTransaction, useAdminTransactions };
export type { Transaction };
