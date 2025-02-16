
import { Send, Smartphone, Signal } from "lucide-react";
import { useEffect, useState } from "react";

interface Transaction {
  type: "send" | "airtime" | "data";
  to: string;
  amount: string;
  date: "Today" | "Yesterday";
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

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("transactions");
    if (stored) {
      const parsedTransactions = JSON.parse(stored);
      const formattedTransactions = parsedTransactions.map((t: any) => ({
        type: t.type || "send",
        to: t.phoneNumber,
        amount: t.amount,
        date: t.date
      }));
      setTransactions(formattedTransactions);
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#070058] mb-4">Recent Transactions</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recent transactions
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(
            transactions.reduce((acc, transaction) => {
              if (!acc[transaction.date]) {
                acc[transaction.date] = [];
              }
              acc[transaction.date].push(transaction);
              return acc;
            }, {} as Record<string, Transaction[]>)
          ).map(([date, transactions]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-600">{date}</span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>
              <div className="space-y-4">
                {transactions.map((transaction, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                      {getIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#070058]">
                        {getTitle(transaction.type)}
                      </p>
                      <p className="text-sm text-gray-500">To {transaction.to}</p>
                    </div>
                    <p className="font-semibold text-[#070058]">{transaction.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
