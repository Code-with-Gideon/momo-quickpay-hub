
import { Send, Smartphone, Signal } from "lucide-react";
import { Transaction } from "@/utils/transactionService";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Define component props interface
interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const getIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "send":
      return <Send className="w-6 h-6 text-white" />;
    case "airtime":
      return <Smartphone className="w-6 h-6 text-white" />;
    case "data":
      return <Signal className="w-6 h-6 text-white" />;
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

// Format timestamp to "Today" or "Yesterday" or date string
const formatDate = (timestamp: number): string => {
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
      day: "numeric" 
    });
  }
};

const RecentTransactions = ({ transactions, isLoading }: RecentTransactionsProps) => {
  const navigate = useNavigate();

  // Group transactions by date for display
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Get only the last 5 transactions for the preview
  const recentFiveTransactions = transactions.slice(0, 5);

  // Group the recent 5 transactions by date
  const recentGroupedTransactions = recentFiveTransactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#070058] mb-4">Recent Transactions</h2>
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      ) : recentFiveTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recent transactions
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(recentGroupedTransactions).map(([date, dayTransactions]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-600">{date}</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>
              <div className="space-y-4">
                {dayTransactions.map((transaction, idx) => {
                  // Determine the recipient info based on transaction type
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
                        <p className="text-sm text-gray-500">To {recipient}</p>
                      </div>
                      <p className="font-semibold text-[#070058]">{transaction.amount}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="text-center mt-6">
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="outline" 
              className="border-[#070058] text-[#070058]"
            >
              View Transaction Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
