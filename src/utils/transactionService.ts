
interface BaseTransaction {
  type: "send" | "airtime" | "data";
  amount: string;
  date: "Today" | "Yesterday";
  timestamp: number;
  userId: string;
}

export interface SendTransaction extends BaseTransaction {
  type: "send";
  to: string;
  isMomoPay?: boolean;
}

export interface AirtimeTransaction extends BaseTransaction {
  type: "airtime";
  phoneNumber: string;
}

export interface DataTransaction extends BaseTransaction {
  type: "data";
  phoneNumber: string;
  dataPackage?: string;
}

export type Transaction = SendTransaction | AirtimeTransaction | DataTransaction;

export const transactionService = {
  // Save a new transaction
  saveTransaction: (transaction: Transaction): void => {
    // Ensure transaction has timestamp and userId
    const enhancedTransaction = {
      ...transaction,
      timestamp: transaction.timestamp || Date.now(),
      userId: transaction.userId || 'demo-user'
    };

    // Save to general transactions
    const stored = localStorage.getItem("transactions");
    const transactions = stored ? JSON.parse(stored) : [];
    localStorage.setItem(
      "transactions", 
      JSON.stringify([enhancedTransaction, ...transactions].slice(0, 50))
    );

    // Also save to type-specific storage for backwards compatibility
    if (transaction.type === "send") {
      const sendStored = localStorage.getItem("send_money_history");
      const sendTransactions = sendStored ? JSON.parse(sendStored) : [];
      localStorage.setItem(
        "send_money_history", 
        JSON.stringify([enhancedTransaction, ...sendTransactions].slice(0, 20))
      );
    }
  },

  // Get all transactions
  getAllTransactions: (): Transaction[] => {
    const stored = localStorage.getItem("transactions");
    if (!stored) return [];
    
    try {
      const transactions = JSON.parse(stored);
      return transactions.sort((a: Transaction, b: Transaction) => 
        (b.timestamp || 0) - (a.timestamp || 0)
      );
    } catch (error) {
      console.error("Error parsing transactions:", error);
      return [];
    }
  },

  // Get transactions for a specific user
  getUserTransactions: (userId: string): Transaction[] => {
    const allTransactions = transactionService.getAllTransactions();
    return allTransactions.filter(t => t.userId === userId);
  },

  // Get transactions by type
  getTransactionsByType: (type: Transaction["type"]): Transaction[] => {
    const allTransactions = transactionService.getAllTransactions();
    return allTransactions.filter(t => t.type === type);
  },
  
  // Get recent transactions (last n days)
  getRecentTransactions: (days: number = 7): Transaction[] => {
    const allTransactions = transactionService.getAllTransactions();
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    return allTransactions.filter(t => (t.timestamp || 0) > cutoffTime);
  }
};
