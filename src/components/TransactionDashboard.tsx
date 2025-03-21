
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import SendMoneyView from "./SendMoneyView";
import BuyAirtimeView from "./BuyAirtimeView";
import BuyDataView from "./BuyDataView";
import RecentTransactions from "./RecentTransactions";
import { Download } from "lucide-react";
import { 
  Table, 
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface TransactionDashboardProps {
  userId?: string;
  isAdmin?: boolean;
}

const TransactionDashboard: React.FC<TransactionDashboardProps> = ({ 
  userId,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState("send");
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use the useTransactions hook to fetch and manage transactions
  const { transactions, addTransaction, isLoading } = useTransactions({ 
    userId: userId,
    refreshInterval: 5000 // Refresh every 5 seconds
  });

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type if not "all"
    if (filterType !== "all" && transaction.type !== filterType) {
      return false;
    }
    
    // Search by recipient or amount
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      // Check recipient based on transaction type
      let recipientToCheck = '';
      if (transaction.type === 'send' && 'to' in transaction) {
        recipientToCheck = transaction.to;
      } else if ((transaction.type === 'airtime' || transaction.type === 'data') && 
                'phoneNumber' in transaction) {
        recipientToCheck = transaction.phoneNumber;
      }
      
      return (
        recipientToCheck.toLowerCase().includes(searchLower) ||
        transaction.amount.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleExportPDF = () => {
    const element = document.getElementById('transaction-table');
    if (!element) return;
    
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('transactions.pdf');
    });
  };

  const toggleView = () => {
    setShowAllTransactions(!showAllTransactions);
  };

  if (!showAllTransactions) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="send">Send Money</TabsTrigger>
              <TabsTrigger value="airtime">Buy Airtime</TabsTrigger>
              <TabsTrigger value="data">Buy Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Send Money</CardTitle>
                </CardHeader>
                <CardContent>
                  <SendMoneyView onBack={() => {}} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="airtime" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Buy Airtime</CardTitle>
                </CardHeader>
                <CardContent>
                  <BuyAirtimeView onBack={() => {}} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Buy Data Bundle</CardTitle>
                </CardHeader>
                <CardContent>
                  <BuyDataView onBack={() => {}} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="col-span-1 md:col-span-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentTransactions />
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={toggleView}
                >
                  View Transaction Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <Button variant="outline" onClick={toggleView}>Back to Dashboard</Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Transactions</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <Download size={16} />
              Export PDF
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="w-full md:w-1/3">
              <Select 
                value={filterType} 
                onValueChange={setFilterType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="send">Money Transfers</SelectItem>
                  <SelectItem value="airtime">Airtime</SelectItem>
                  <SelectItem value="data">Data Bundles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-2/3">
              <Input
                placeholder="Search by recipient or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#070058]"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table id="transaction-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => {
                    // Extract recipient based on transaction type
                    let recipient = '';
                    if (transaction.type === 'send' && 'to' in transaction) {
                      recipient = transaction.to;
                    } else if ((transaction.type === 'airtime' || transaction.type === 'data') && 
                              'phoneNumber' in transaction) {
                      recipient = transaction.phoneNumber;
                    }
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="capitalize">{transaction.type}</TableCell>
                        <TableCell>{recipient}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-[#070058]"
                            onClick={() => {
                              // Create a unique receipt URL
                              const receiptId = btoa(JSON.stringify({
                                type: transaction.type,
                                recipient: recipient,
                                amount: transaction.amount,
                                date: transaction.date,
                                timestamp: transaction.timestamp
                              }));
                              window.open(`/receipt/${receiptId}`, '_blank');
                            }}
                          >
                            View Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDashboard;
