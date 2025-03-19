
import { useState, useEffect } from "react";
import { Send, Smartphone, Signal, Download, User } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/utils/transactionService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const getIcon = (type: Transaction["type"] | string) => {
  switch (type) {
    case "send":
      return <Send className="w-5 h-5 text-white" />;
    case "airtime":
      return <Smartphone className="w-5 h-5 text-white" />;
    case "data":
      return <Signal className="w-5 h-5 text-white" />;
    default:
      return <Send className="w-5 h-5 text-white" />;
  }
};

const getTitle = (type: Transaction["type"] | string) => {
  switch (type) {
    case "send":
      return "Send Money";
    case "airtime":
      return "Buy Airtime";
    case "data":
      return "Buy Data";
    default:
      return "Transaction";
  }
};

const formatAmount = (amount: string | number) => {
  if (typeof amount === 'number') {
    return `RWF ${amount}`;
  }
  
  const cleanedAmount = amount.replace(/[^0-9,.]/g, "");
  return `RWF ${cleanedAmount}`;
};

const formatDate = (timestamp: number | string | Date) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: today.getFullYear() !== date.getFullYear() ? "numeric" : undefined 
    });
  }
};

const exportToCSV = (transactions: any[]) => {
  if (transactions.length === 0) return;
  
  const headers = "Type,Amount,Date,To/Phone,User ID\n";
  const csvContent = transactions.map(t => {
    const recipient = t.recipient || '';
    return `${t.transaction_type || t.type},${t.amount},${formatDate(t.created_at || t.timestamp)},${recipient},${t.user_id || t.userId}`;
  }).join("\n");
  
  const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `transactions_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface TransactionDashboardProps {
  userId?: string;
  isAdmin?: boolean;
}

const TransactionDashboard = ({ userId }: TransactionDashboardProps) => {
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<Transaction["type"] | "all">("all");
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "all">("7");
  const [userFilter, setUserFilter] = useState(userId || "all");
  const [supabaseTransactions, setSupabaseTransactions] = useState<any[]>([]);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  
  const days = timeRange === "all" ? undefined : parseInt(timeRange);
  
  // Get local storage transactions (for fallback and legacy support)
  const { transactions: localTransactions, isLoading: isLoadingLocal } = useTransactions({
    userId: userFilter !== "all" ? userFilter : undefined,
    type: filter !== "all" ? filter as Transaction["type"] : undefined,
    recentDays: days,
    refreshInterval: 60000,
  });

  // Fetch transactions from Supabase when admin
  useEffect(() => {
    const fetchSupabaseTransactions = async () => {
      if (!isAdmin) return;
      
      setIsLoadingSupabase(true);
      try {
        // Admin sees all_transactions view
        let query = supabase.from('all_transactions').select('*');
        
        // Apply filters
        if (filter !== 'all') {
          query = query.eq('transaction_type', filter);
        }
        
        if (userFilter !== 'all') {
          query = query.eq('user_id', userFilter);
        }
        
        if (days) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          query = query.gte('created_at', cutoffDate.toISOString());
        }
        
        // Sort by created_at descending
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }
        
        setSupabaseTransactions(data || []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setIsLoadingSupabase(false);
      }
    };

    fetchSupabaseTransactions();
  }, [isAdmin, filter, userFilter, days, timeRange]);

  // Determine which transactions to use (Supabase for admin, local for regular users)
  const transactions = isAdmin ? supabaseTransactions : localTransactions;
  const isLoading = isAdmin ? isLoadingSupabase : isLoadingLocal;

  const handleFilterChange = (value: string) => {
    setFilter(value as Transaction["type"] | "all");
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as "7" | "30" | "90" | "all");
  };

  const handleUserFilterChange = (value: string) => {
    setUserFilter(value);
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.created_at || transaction.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate stats
  const stats = {
    total: transactions.length,
    send: transactions.filter(t => (t.transaction_type || t.type) === "send").length,
    airtime: transactions.filter(t => (t.transaction_type || t.type) === "airtime").length,
    data: transactions.filter(t => (t.transaction_type || t.type) === "data").length,
    totalAmount: transactions.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' 
        ? t.amount 
        : parseFloat(t.amount.replace(/[^0-9.]/g, "")) || 0;
      return sum + amount;
    }, 0),
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#070058] mb-4">Transaction History</h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="send">Send Money</SelectItem>
              <SelectItem value="airtime">Buy Airtime</SelectItem>
              <SelectItem value="data">Buy Data</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          {isAdmin && (
            <Select value={userFilter} onValueChange={handleUserFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="demo-user">Demo User</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button 
            variant="outline" 
            className="ml-auto" 
            onClick={() => exportToCSV(transactions)}
            disabled={transactions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              {isAdmin && <TabsTrigger value="users">User Summary</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="list">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-600">{date}</span>
                        <div className="flex-1 h-[1px] bg-gray-200" />
                      </div>
                      <div className="space-y-4">
                        {dayTransactions.map((transaction, idx) => {
                          const recipient = transaction.recipient || 
                            (transaction.to || transaction.phoneNumber || 'Unknown');
                          const transactionType = transaction.transaction_type || transaction.type;
                          const userId = transaction.user_id || transaction.userId;
                          
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                                {getIcon(transactionType)}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-[#070058]">
                                  {getTitle(transactionType)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  To {recipient}
                                  {isAdmin && (
                                    <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                      {userId} {transaction.user_email && `(${transaction.user_email})`}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className="font-semibold text-[#070058]">{formatAmount(transaction.amount)}</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => window.open(`/receipt/${transaction.id || idx}`, '_blank')}
                              >
                                Receipt
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="users">
              {isAdmin ? (
                <div className="space-y-4">
                  {/* Group transactions by user for admin view */}
                  {Array.from(new Set(transactions.map(t => t.user_id || t.userId))).map(userId => {
                    // Type check to ensure we have an array before mapping
                    if (!transactions || !Array.isArray(transactions)) {
                      return null;
                    }
                    
                    const userTransactions = transactions.filter(t => (t.user_id || t.userId) === userId);
                    const userEmail = userTransactions[0]?.user_email || 'Unknown User';
                    const totalAmount = userTransactions.reduce((sum, t) => {
                      const amount = typeof t.amount === 'number' 
                        ? t.amount 
                        : parseFloat(t.amount.replace(/[^0-9.]/g, "")) || 0;
                      return sum + amount;
                    }, 0);
                    
                    return (
                      <div key={userId as string} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-[#070058] flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#070058]">{userEmail}</p>
                          <p className="text-sm text-gray-500">
                            {userTransactions.length} transactions
                          </p>
                        </div>
                        <p className="font-semibold text-[#070058]">
                          RWF {totalAmount.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  User summary is only available for admins
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TransactionDashboard;
