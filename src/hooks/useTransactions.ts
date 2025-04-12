
// This file is now just a proxy to maintain backward compatibility
// All functionality has been moved to the hooks/transactions directory

import { useTransactions as useTransactionsNew } from './transactions';
import type { Transaction } from '@/utils/transactionService';

interface UseTransactionsOptions {
  userId?: string;
  type?: "send" | "airtime" | "data";
  recentDays?: number;
  refreshInterval?: number;
  isAdmin?: boolean;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  return useTransactionsNew(options);
}

// Re-export for convenience
export type { Transaction };
