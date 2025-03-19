
import { useState, useEffect } from 'react';
import { Transaction, transactionService } from '../utils/transactionService';

interface UseTransactionsOptions {
  userId?: string;
  type?: "send" | "airtime" | "data";
  recentDays?: number;
  refreshInterval?: number;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = () => {
      setIsLoading(true);
      let result: Transaction[] = [];

      try {
        if (options.userId) {
          // Get transactions for specific user
          result = transactionService.getUserTransactions(options.userId);
        } else if (options.type) {
          // Get transactions by type
          result = transactionService.getTransactionsByType(options.type);
        } else if (options.recentDays) {
          // Get recent transactions
          result = transactionService.getRecentTransactions(options.recentDays);
        } else {
          // Get all transactions
          result = transactionService.getAllTransactions();
        }

        setTransactions(result);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchTransactions();

    // Set up refresh interval if specified
    let intervalId: number | null = null;
    if (options.refreshInterval) {
      intervalId = window.setInterval(fetchTransactions, options.refreshInterval);
    }

    // Listen for storage events to update in real-time across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'transactions') {
        fetchTransactions();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [options.userId, options.type, options.recentDays, options.refreshInterval]);

  // Additional function to add a new transaction
  const addTransaction = (transaction: Omit<Transaction, 'timestamp' | 'userId'> & { timestamp?: number, userId?: string }) => {
    const fullTransaction = {
      ...transaction,
      timestamp: transaction.timestamp || Date.now(),
      userId: transaction.userId || 'demo-user'
    } as Transaction;
    
    transactionService.saveTransaction(fullTransaction);
    setTransactions(prev => [fullTransaction, ...prev]);
    return fullTransaction;
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    refreshTransactions: () => setTransactions(transactionService.getAllTransactions()),
  };
}
