
import { useState, useEffect } from 'react';
import { Transaction, transactionService } from '../utils/transactionService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseTransactionsOptions {
  userId?: string;
  type?: "send" | "airtime" | "data";
  recentDays?: number;
  refreshInterval?: number;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      let result: Transaction[] = [];

      try {
        // If user is authenticated, fetch from Supabase
        if (user) {
          let query;
          
          // If user is admin and no specific userId was requested, fetch all transactions
          if (isAdmin && !options.userId) {
            // Admins get access to all transactions
            query = supabase.from('admin_transaction_view').select('*');
          } else {
            // Regular users or when specific user's transactions are requested
            query = supabase.from('transactions').select('*');
            
            if (options.userId) {
              query = query.eq('user_id', options.userId);
            } else if (user && !isAdmin) {
              // Non-admin users only see their own transactions
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
          
          query = query.order('created_at', { ascending: false });
          
          const { data, error } = await query;
          
          if (error) {
            console.error('Error fetching transactions from Supabase:', error);
            // Fallback to local storage if Supabase fails
            result = fetchFromLocalStorage();
          } else {
            console.log('Fetched transactions:', data);
            // Convert Supabase format to local format with proper type checking
            result = (data || []).map((t: any): Transaction => {
              const baseTransaction = {
                type: t.transaction_type as Transaction['type'],
                amount: `RWF ${t.amount}`,
                date: formatDateToRelative(t.created_at),
                timestamp: new Date(t.created_at).getTime(),
                userId: t.user_id,
              };
              
              // Create the correct transaction type based on transaction_type
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
              
              // Fallback (should never happen with proper data)
              return {
                ...baseTransaction,
                type: 'send',
                to: t.recipient || 'Unknown',
                isMomoPay: false
              };
            });
          }
        } else {
          // Not authenticated, use local storage
          result = fetchFromLocalStorage();
        }

        setTransactions(result);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        // Fallback to local storage on any error
        result = fetchFromLocalStorage();
        setTransactions(result);
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to fetch from localStorage
    const fetchFromLocalStorage = (): Transaction[] => {
      if (options.userId) {
        return transactionService.getUserTransactions(options.userId);
      } else if (options.type) {
        return transactionService.getTransactionsByType(options.type);
      } else if (options.recentDays) {
        return transactionService.getRecentTransactions(options.recentDays);
      } else {
        return transactionService.getAllTransactions();
      }
    };

    // Helper function to format date
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

    // Subscription to Supabase realtime changes if user is authenticated
    let subscription: any;
    if (user) {
      subscription = supabase
        .channel('transactions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          fetchTransactions();
        })
        .subscribe();
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
      window.removeEventListener('storage', handleStorageChange);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [options.userId, options.type, options.recentDays, options.refreshInterval, user, isAdmin]);

  // Function to add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, 'timestamp' | 'userId'> & { timestamp?: number, userId?: string }) => {
    // Generate a full transaction object for local storage
    const fullTransaction = {
      ...transaction,
      timestamp: transaction.timestamp || Date.now(),
      userId: transaction.userId || user?.id || 'demo-user'
    } as Transaction;
    
    try {
      // If user is authenticated, save to Supabase
      if (user) {
        console.log('Saving transaction to Supabase:', fullTransaction);
        
        // Map local transaction format to Supabase format
        const supabaseTransaction = {
          user_id: user.id,
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
          // Fallback to local storage if Supabase fails
          transactionService.saveTransaction(fullTransaction);
        } else {
          console.log('Transaction saved successfully:', data);
        }
      } else {
        // Not authenticated, save to local storage
        transactionService.saveTransaction(fullTransaction);
      }
      
      // Update local state
      setTransactions(prev => [fullTransaction, ...prev]);
      return fullTransaction;
    } catch (error) {
      console.error('Failed to save transaction:', error);
      // Fallback to local storage on any error
      transactionService.saveTransaction(fullTransaction);
      setTransactions(prev => [fullTransaction, ...prev]);
      return fullTransaction;
    }
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    refreshTransactions: () => {
      // Will trigger the useEffect to reload from Supabase or localStorage
      setIsLoading(true);
    },
  };
}
