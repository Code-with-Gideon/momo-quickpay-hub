
import { useCallback } from 'react';
import { Transaction, transactionService } from '../../utils/transactionService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAddTransaction() {
  const { user } = useAuth();

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
      
      // Notify other components about the change
      window.dispatchEvent(new Event('storage'));
      
      return fullTransaction;
    } catch (error) {
      console.error('Failed to save transaction:', error);
      transactionService.saveTransaction(fullTransaction);
      return fullTransaction;
    }
  }, [user]);

  return { addTransaction };
}
