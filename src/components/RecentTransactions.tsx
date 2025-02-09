
import { Send, Smartphone, Signal } from "lucide-react";

interface Transaction {
  type: "send" | "airtime" | "data";
  to: string;
  amount: string;
  date: "Today" | "Yesterday";
}

const mockTransactions: Transaction[] = [
  { type: "send", to: "(Account Number)", amount: "Amount", date: "Today" },
  { type: "airtime", to: "(Account Number)", amount: "Amount", date: "Today" },
  { type: "data", to: "(Account Number)", amount: "Amount", date: "Yesterday" },
];

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
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#221F26] mb-4">Recent Transactions</h2>
      <div className="space-y-6">
        {Object.entries(
          mockTransactions.reduce((acc, transaction) => {
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
                  <div className="w-12 h-12 rounded-full bg-[#221F26] flex items-center justify-center">
                    {getIcon(transaction.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#221F26]">
                      {getTitle(transaction.type)}
                    </p>
                    <p className="text-sm text-gray-500">To {transaction.to}</p>
                  </div>
                  <p className="font-semibold text-[#221F26]">{transaction.amount}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
