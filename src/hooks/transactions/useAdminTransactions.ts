
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseAdminTransactionsOptions {
  isAdmin?: boolean;
}

export function useAdminTransactions(options: UseAdminTransactionsOptions = {}) {
  const { isAdmin: authIsAdmin } = useAuth();
  const isAdmin = authIsAdmin || options.isAdmin;

  const updateTransaction = useCallback(async (id: string, updates: any) => {
    if (!isAdmin) {
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
      
      // Notify other components about the change
      window.dispatchEvent(new Event('storage'));
      
      return data[0];
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  }, [isAdmin]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!isAdmin) {
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
      
      // Notify other components about the change
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }, [isAdmin]);

  return {
    updateTransaction,
    deleteTransaction
  };
}
