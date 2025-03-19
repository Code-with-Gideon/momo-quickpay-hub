
import { useState } from "react";
import { Send, Smartphone, Signal, Filter, Download, User } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/utils/transactionService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "send":
      return <Send className="w-5 h-5 text-white" />;
    case "airtime":
      return <Smartphone className="w-5 h-5 text-white" />;
    case "data":
      return <Signal className="w-5 h-5 text-white" />;
  }
};

const getTitle = (type: Transaction["type"]) => {
  switch (type) {
    case "send":
      return "Send Money";
    case "airtime":
      return "Buy Airtime";
    case "data":
      return "Buy Data";
  }
};

const formatAmount = (amount: string) => {
  // Remove non-numeric characters except commas and dots
  const cleanedAmount = amount.replace(/[^0-9,.]/g, "");
  return `RWF ${cleanedAmount}`;
};

const formatDate = (timestamp: number) => {
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

// Utility function to export transactions to CSV
const exportToCSV = (transactions: Transaction[]) => {
  if (transactions.length === 0) return;
  
  // Format transactions for CSV
  const headers = "Type,Amount,Date,To/Phone,User ID\n";
  const csvContent = transactions.map(t => {
    const recipient = 'to' in t ? t.to : t.phoneNumber;
    return `${t.type},${t.amount},${formatDate(t.timestamp)},${recipient},${t.userId}`;
  }).join("\n");
  
  // Create and download the file
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

const TransactionDashboard = ({ userId, isAdmin = false }: TransactionDashboardProps) => {
  const [filter, setFilter] = useState<Transaction["type"] | "all">("all");
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "all">("7");
  const [userFilter, setUserFilter] = useState(userId || "all");
  
  // Convert timeRange to number of days for the hook
  const days = timeRange === "all" ? undefined : parseInt(timeRange);
  
  // Use our custom hook to get transactions
  const { transactions, isLoading } = useTransactions({
    userId: userFilter !== "all" ? userFilter : undefined,
    type: filter !== "all" ? filter as Transaction["type"] : undefined,
    recentDays: days,
    refreshInterval: 60000, // Refresh every minute
  });

  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Calculate some basic stats
  const stats = {
    total: transactions.length,
    send: transactions.filter(t => t.type === "send").length,
    airtime: transactions.filter(t => t.type === "airtime").length,
    data: transactions.filter(t => t.type === "data").length,
    totalAmount: transactions.reduce((sum, t) => {
      const amount = t.amount.replace(/[^0-9]/g, "");
      return sum + (parseInt(amount) || 0);
    }, 0),
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#070058] mb-4">Transaction Dashboard</h2>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-[#070058]">{stats.total}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-sm">Send Money</p>
            <p className="text-2xl font-bold text-[#070058]">{stats.send}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-sm">Buy Airtime</p>
            <p className="text-2xl font-bold text-[#070058]">{stats.airtime}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-500 text-sm">Buy Data</p>
            <p className="text-2xl font-bold text-[#070058]">{stats.data}</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={filter} onValueChange={setFilter}>
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
          
          <Select value={timeRange} onValueChange={setTimeRange}>
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
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="demo-user">Demo User</SelectItem>
                {/* In a real app, you would fetch and populate users from database */}
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

        {/* Transactions List */}
        <div>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="users">User Summary</TabsTrigger>
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
                          const recipient = 'to' in transaction 
                            ? transaction.to 
                            : transaction.phoneNumber;
                          
                          return (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                                {getIcon(transaction.type)}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-[#070058]">
                                  {getTitle(transaction.type)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  To {recipient}
                                  {isAdmin && (
                                    <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                      {transaction.userId}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className="font-semibold text-[#070058]">{transaction.amount}</p>
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
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-[#070058] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#070058]">Demo User</p>
                      <p className="text-sm text-gray-500">
                        {transactions.filter(t => t.userId === 'demo-user').length} transactions
                      </p>
                    </div>
                    <p className="font-semibold text-[#070058]">
                      RWF {transactions
                        .filter(t => t.userId === 'demo-user')
                        .reduce((sum, t) => {
                          const amount = t.amount.replace(/[^0-9]/g, "");
                          return sum + (parseInt(amount) || 0);
                        }, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  {/* In a real app, you would map through all users */}
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
