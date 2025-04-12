
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionType {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone_number: string | null;
  amount: number;
  transaction_type: string;
  recipient: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface TransactionListProps {
  transactions: TransactionType[];
  isLoading: boolean;
  selectedUser: string | null;
  onEditTransaction: (transaction: TransactionType) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onDownloadCSV: () => void;
  onRefresh: () => void;
  onBackToUsers: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  selectedUser,
  onEditTransaction,
  onDeleteTransaction,
  onDownloadCSV,
  onRefresh,
  onBackToUsers
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>User Transactions</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBackToUsers}>
            Back to Users
          </Button>
          <Button variant="outline" onClick={onDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {selectedUser ? (
          isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#070058] mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No transactions found for this user</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="capitalize">
                        {transaction.transaction_type}
                      </TableCell>
                      <TableCell>RWF {transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>{transaction.recipient}</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => onEditTransaction(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => onDeleteTransaction(transaction.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">Select a user to view their transactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
