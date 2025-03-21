
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SendMoneyView from "./SendMoneyView";
import BuyAirtimeView from "./BuyAirtimeView";
import BuyDataView from "./BuyDataView";
import RecentTransactions from "./RecentTransactions";
import { useTransactions } from "@/hooks/useTransactions";
import { useNavigate } from "react-router-dom";

export interface TransactionDashboardProps {
  userId?: string;
  isAdmin?: boolean;
}

const TransactionDashboard = ({ userId, isAdmin }: TransactionDashboardProps) => {
  const [activeView, setActiveView] = useState<string>("recent");
  const navigate = useNavigate();
  
  // Initialize the useTransactions hook with the correct userId
  const { 
    transactions, 
    isLoading, 
    addTransaction, 
    refreshTransactions 
  } = useTransactions({ 
    userId: userId 
  });

  // Function to handle successful transaction completion
  const handleTransactionComplete = async (transaction: any) => {
    console.log("Transaction completed:", transaction);
    const savedTransaction = await addTransaction(transaction);
    
    // Navigate to receipt page and pass transaction data
    navigate("/receipt", { 
      state: { 
        transaction: savedTransaction,
        isNew: true 
      } 
    });
  };

  // Function to go back to recent transactions view
  const handleBackToRecent = () => {
    setActiveView("recent");
    refreshTransactions();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {activeView === "recent" ? (
            "Transaction Dashboard"
          ) : (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2 p-0" 
                onClick={handleBackToRecent}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
              {activeView === "send" && "Send Money"}
              {activeView === "airtime" && "Buy Airtime"}
              {activeView === "data" && "Buy Data Bundle"}
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {activeView === "recent" ? (
          <>
            <Tabs defaultValue="transactions" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="send">Send Money</TabsTrigger>
                <TabsTrigger value="buy">Buy Services</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions">
                <RecentTransactions 
                  transactions={transactions}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="send">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className="cursor-pointer hover:border-[#070058] transition-colors"
                    onClick={() => setActiveView("send")}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Send Money</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Transfer money to another MoMo account
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="buy">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className="cursor-pointer hover:border-[#070058] transition-colors"
                    onClick={() => setActiveView("airtime")}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Buy Airtime</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Purchase airtime for any phone number
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:border-[#070058] transition-colors"
                    onClick={() => setActiveView("data")}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Buy Data Bundle</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Purchase data bundles for any phone number
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : activeView === "send" ? (
          <SendMoneyView 
            onBack={handleBackToRecent}
            onTransactionComplete={handleTransactionComplete}
          />
        ) : activeView === "airtime" ? (
          <BuyAirtimeView 
            onBack={handleBackToRecent}
            onTransactionComplete={handleTransactionComplete}
          />
        ) : activeView === "data" ? (
          <BuyDataView 
            onBack={handleBackToRecent}
            onTransactionComplete={handleTransactionComplete}
          />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TransactionDashboard;
