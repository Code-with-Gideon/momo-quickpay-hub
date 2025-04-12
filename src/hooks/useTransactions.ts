
import { useState, useEffect, useCallback } from 'react';
import { Transaction, transactionService } from '../utils/transactionService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseTransactionsOptions {
  userId?: string;
  type?: "send" | "airtime" | "data";
  recentDays?: number;
  refreshInterval?: number;
  isAdmin?: boolean;
}

// Helper functions for cleaner code
const formatDateToRelative = (dateString: string): "Today" | "Yesterday" => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return "Today"; // Default fallback
  }
};

const mapDbTransactionToApp = (t: any): Transaction => {
  const baseTransaction = {
    type: t.transaction_type as Transaction['type'],
    amount: `RWF ${t.amount}`,
    date: formatDateToRelative(t.created_at),
    timestamp: new Date(t.created_at).getTime(),
    userId: t.user_id,
    id: t.id
  };
  
  if (t.transaction_type === 'send') {
    return {
      ...baseTransaction,
      type: 'send',
      to: t.recipient,
      isMomoPay: false
    };
  } else if (t.transaction_type === 'airtime') {
    return {
      ...baseTransaction,
      type: 'airtime',
      phoneNumber: t.recipient
    };
  } else if (t.transaction_type === 'data') {
    return {
      ...baseTransaction, 
      type: 'data',
      phoneNumber: t.recipient,
      dataPackage: t.description || 'Standard Data'
    };
  }
  
  return {
    ...baseTransaction,
    type: 'send',
    to: t.recipient || 'Unknown',
    isMomoPay: false
  };
};

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  // Build query for supabase
  const buildTransactionQuery = useCallback(() => {
    let query;
    
    if ((isAdmin || options.isAdmin) && !options.userId) {
      console.log('Admin fetching all transactions');
      query = supabase.from('admin_transaction_view').select('*');
    } else {
      console.log('Fetching transactions for specific user or current user');
      query = supabase.from('transactions').select('*');
      
      if (options.userId) {
        console.log('Fetching transactions for user ID:', options.userId);
        query = query.eq('user_id', options.userId);
      } else if (user && !isAdmin) {
        console.log('Non-admin user fetching own transactions');
        query = query.eq('user_id', user.id);
      }
    }
    
    if (options.type) {
      query = query.eq('transaction_type', options.type);
    }
    
    if (options.recentDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.recentDays);
      query = query.gte('created_at', cutoffDate.toISOString());
    }
    
    return query.order('created_at', { ascending: false });
  }, [user, isAdmin, options.userId, options.type, options.recentDays, options.isAdmin]);

  // Fetch from local storage when needed
  const fetchFromLocalStorage = useCallback((): Transaction[] => {
    if (options.userId) {
      return transactionService.getUserTransactions(options.userId);
    } else if (options.type) {
      return transactionService.getTransactionsByType(options.type);
    } else if (options.recentDays) {
      return transactionService.getRecentTransactions(options.recentDays);
    } else {
      return transactionService.getAllTransactions();
    }
  }, [options.userId, options.type, options.recentDays]);

  // Main fetch function
  const fetchTransactions = useCallback(async () => {
    console.log('Fetching transactions with options:', options);
    console.log('User ID being fetched:', options.userId);
    console.log('Is admin flag:', isAdmin || options.isAdmin);
    
    setIsLoading(true);
    let result: Transaction[] = [];

    try {
      if (user) {
        const query = buildTransactionQuery();
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching transactions from Supabase:', error);
          result = fetchFromLocalStorage();
        } else {
          console.log('Fetched transactions:', data);
          result = (data || []).map(mapDbTransactionToApp);
        }
      } else {
        result = fetchFromLocalStorage();
      }

      console.log('Setting transactions state with:', result.length, 'items');
      setTransactions(result);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      result = fetchFromLocalStorage();
      setTransactions(result);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin, buildTransactionQuery, fetchFromLocalStorage, options.userId, options.isAdmin]);

  // Transaction data operations
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'timestamp' | 'userId'> & { timestamp?: number, userId?: string }) => {
    const fullTransaction = {
      ...transaction,
      timestamp: transaction.timestamp || Date.now(),
      userId: transaction.userId || user?.id || 'demo-user'
    } as Transaction;
    
    try {
      if (user) {
        console.log('Saving transaction to Supabase:', fullTransaction);
        
        const supabaseTransaction = {
          user_id: transaction.userId || user.id,
          amount: parseFloat(transaction.amount.replace(/[^0-9.]/g, "")),
          transaction_type: transaction.type,
          recipient: transaction.type === 'send' 
            ? (transaction as any).to 
            : (transaction as any).phoneNumber,
          description: transaction.type === 'data' 
            ? (transaction as any).dataPackage 
            : null,
          status: 'completed',
          reference: `ref-${Date.now()}`
        };
        
        console.log('Supabase transaction data:', supabaseTransaction);
        
        const { error, data } = await supabase
          .from('transactions')
          .insert(supabaseTransaction)
          .select()
          .single();
          
        if (error) {
          console.error('Error saving transaction to Supabase:', error);
          transactionService.saveTransaction(fullTransaction);
        } else {
          console.log('Transaction saved successfully:', data);
        }
      } else {
        transactionService.saveTransaction(fullTransaction);
      }
      
      setTransactions(prev => [fullTransaction, ...prev]);
      return fullTransaction;
    } catch (error) {
      console.error('Failed to save transaction:', error);
      transactionService.saveTransaction(fullTransaction);
      setTransactions(prev => [fullTransaction, ...prev]);
      return fullTransaction;
    }
  }, [user]);

  // Admin operations
  const adminOperations = {
    updateTransaction: async (id: string, updates: any) => {
      if (!isAdmin && !options.isAdmin) {
        console.error('Only admins can update transactions');
        return null;
      }

      try {
        console.log('Updating transaction:', id, updates);
        const { data, error } = await supabase
          .from('transactions')
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) {
          console.error('Error updating transaction:', error);
          throw error;
        }
        
        console.log('Transaction updated successfully:', data);
        
        await fetchTransactions();
        
        return data[0];
      } catch (error) {
        console.error('Failed to update transaction:', error);
        throw error;
      }
    },

    deleteTransaction: async (id: string) => {
      if (!isAdmin && !options.isAdmin) {
        console.error('Only admins can delete transactions');
        return false;
      }

      try {
        console.log('Deleting transaction:', id);
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting transaction:', error);
          throw error;
        }
        
        console.log('Transaction deleted successfully');
        
        await fetchTransactions();
        
        return true;
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        throw error;
      }
    }
  };

  // Set up side effects
  useEffect(() => {
    console.log('useEffect triggered in useTransactions - fetching transactions');
    console.log('Current userId:', options.userId);
    console.log('Current isAdmin:', options.isAdmin);
    
    fetchTransactions();

    // Set up auto-refresh if requested
    let intervalId: number | null = null;
    if (options.refreshInterval) {
      intervalId = window.setInterval(fetchTransactions, options.refreshInterval);
    }

    // Set up local storage changes listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'transactions') {
        fetchTransactions();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Set up real-time updates via Supabase
    let subscription: any;
    if (user) {
      subscription = supabase
        .channel('transactions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          console.log('Real-time update detected - fetching transactions');
          fetchTransactions();
        })
        .subscribe();
    }

    // Clean up
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
      window.removeEventListener('storage', handleStorageChange);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [options.userId, options.type, options.recentDays, options.refreshInterval, options.isAdmin, user, isAdmin, fetchTransactions]);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction: adminOperations.updateTransaction,
    deleteTransaction: adminOperations.deleteTransaction,
    refreshTransactions: fetchTransactions,
  };
}
