import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import UserMenu from "@/components/UserMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Search, Download, ChevronLeft, ChevronRight, BarChart, 
  Users, Edit, Trash2, X, Check, AlertTriangle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface UserType {
  id: string;
  email: string;
  display_name: string | null;
  phone_number: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

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

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [editTransaction, setEditTransaction] = useState<TransactionType | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch summary statistics
        const { data: transData, error: transError } = await supabase
          .from('admin_transaction_view')
          .select('*');

        if (transError) {
          console.error('Error fetching transactions:', transError);
        } else if (transData) {
          setTotalTransactions(transData.length);
          // Calculate total amount from all transactions
          const total = transData.reduce((sum, trans) => sum + (trans.amount || 0), 0);
          setTotalAmount(total);
        }

        // Fetch paginated users with profiles
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        // Get total count first
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .ilike('display_name', `%${searchTerm}%`);

        setTotalUsers(count || 0);

        // Then fetch the page of data
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            display_name,
            phone_number,
            created_at
          `)
          .ilike('display_name', `%${searchTerm}%`)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (userError) {
          console.error('Error fetching users:', userError);
        } else if (userData) {
          setUsers(userData as UserType[]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate, currentPage, searchTerm]);

  // Fetch user transactions when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const fetchUserTransactions = async () => {
        const { data, error } = await supabase
          .from('admin_transaction_view')
          .select('*')
          .eq('user_id', selectedUser)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user transactions:', error);
        } else if (data) {
          setTransactions(data as TransactionType[]);
        }
      };

      fetchUserTransactions();
    } else {
      setTransactions([]);
    }
  }, [selectedUser]);

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId === selectedUser ? null : userId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleDownloadCSV = () => {
    // Function to generate and download CSV of current data
    const csvData = selectedUser ? 
      [
        ['ID', 'Type', 'Amount', 'Recipient', 'Description', 'Status', 'Date'],
        ...transactions.map(t => [
          t.id,
          t.transaction_type,
          t.amount,
          t.recipient,
          t.description || '',
          t.status,
          new Date(t.created_at).toLocaleString()
        ])
      ] :
      [
        ['ID', 'Email', 'Name', 'Phone', 'Created'],
        ...users.map(u => [
          u.id,
          u.email || '',
          u.display_name || '',
          u.phone_number || '',
          new Date(u.created_at).toLocaleString()
        ])
      ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', selectedUser ? 'user-transactions.csv' : 'users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const updateTransaction = async (values: Partial<TransactionType>) => {
    if (!editTransaction) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          amount: values.amount,
          recipient: values.recipient,
          description: values.description,
          status: values.status
        })
        .eq('id', editTransaction.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state with modified transaction
      setTransactions(prev => 
        prev.map(t => t.id === editTransaction.id 
          ? { ...t, ...values } 
          : t
        )
      );
      
      setEditTransaction(null);
      toast.success("Transaction updated successfully");
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Remove deleted transaction from local state
      setTransactions(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmation(null);
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTransaction) return;
    
    updateTransaction({
      amount: editTransaction.amount,
      recipient: editTransaction.recipient,
      description: editTransaction.description,
      status: editTransaction.status
    });
  };

  const renderTransactionsTable = () => (
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
              <TableCell className="text-right space-x-2">
                <Dialog open={editTransaction?.id === transaction.id} 
                  onOpenChange={(open) => !open && setEditTransaction(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditTransaction(transaction)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Transaction</DialogTitle>
                      <DialogDescription>
                        Make changes to this transaction.
                      </DialogDescription>
                    </DialogHeader>
                    {editTransaction && (
                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="amount" className="text-sm font-medium">
                              Amount
                            </label>
                            <Input 
                              id="amount"
                              type="number"
                              value={editTransaction.amount}
                              onChange={(e) => setEditTransaction({
                                ...editTransaction,
                                amount: parseFloat(e.target.value)
                              })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="recipient" className="text-sm font-medium">
                              Recipient
                            </label>
                            <Input 
                              id="recipient"
                              value={editTransaction.recipient}
                              onChange={(e) => setEditTransaction({
                                ...editTransaction,
                                recipient: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="description" className="text-sm font-medium">
                            Description
                          </label>
                          <Input 
                            id="description"
                            value={editTransaction.description || ''}
                            onChange={(e) => setEditTransaction({
                              ...editTransaction,
                              description: e.target.value
                            })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="status" className="text-sm font-medium">
                            Status
                          </label>
                          <select
                            id="status"
                            value={editTransaction.status}
                            onChange={(e) => setEditTransaction({
                              ...editTransaction,
                              status: e.target.value
                            })}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => setEditTransaction(null)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
                
                <AlertDialog 
                  open={deleteConfirmation === transaction.id}
                  onOpenChange={(open) => !open && setDeleteConfirmation(null)}
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteConfirmation(transaction.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                  
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        Delete Transaction
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this transaction? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmation(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteTransaction(transaction.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const TransactionsTabContent = () => (
    <TabsContent value="transactions">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>User Transactions</CardTitle>
          <Button variant="outline" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {selectedUser ? (
            transactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No transactions found for this user</p>
              </div>
            ) : (
              renderTransactionsTable()
            )
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">Select a user to view their transactions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#070058]">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage users and transactions</p>
          </div>
          <UserMenu />
        </header>
        
        {!isAdmin ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-500 mb-4">You don't have permission to view this page.</p>
              <Button onClick={() => navigate("/")}>Return Home</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold">{totalUsers}</div>
                    <div className="ml-2 text-sm text-gray-500">accounts</div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <Users className="h-4 w-4 mr-1 text-[#070058]" />
                    <span>User accounts registered</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold">{totalTransactions}</div>
                    <div className="ml-2 text-sm text-gray-500">processed</div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <BarChart className="h-4 w-4 mr-1 text-[#070058]" />
                    <span>All time transaction count</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold">RWF {totalAmount.toLocaleString()}</div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <BarChart className="h-4 w-4 mr-1 text-[#070058]" />
                    <span>Cumulative transaction value</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="users" className="w-full">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="transactions" disabled={!selectedUser}>
                  User Transactions {selectedUser ? `(${transactions.length})` : ''}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="users">
                <Card>
                  <CardHeader className="pb-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <CardTitle>All Users</CardTitle>
                      <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-8 w-full md:w-[180px]"
                          />
                        </div>
                        <Button variant="outline" onClick={handleDownloadCSV}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#070058] mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading users...</p>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">No users found</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[100px]">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user) => (
                                <TableRow 
                                  key={user.id} 
                                  className={selectedUser === user.id ? "bg-blue-50" : ""}
                                >
                                  <TableCell className="font-medium">
                                    {user.display_name || 'N/A'}
                                  </TableCell>
                                  <TableCell>{user.email || 'N/A'}</TableCell>
                                  <TableCell>{user.phone_number || 'N/A'}</TableCell>
                                  <TableCell>{formatDate(user.created_at)}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant={selectedUser === user.id ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handleUserSelect(user.id)}
                                    >
                                      {selectedUser === user.id ? "Hide Transactions" : "View Transactions"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-gray-500">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                          </p>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => 
                                setCurrentPage((prev) => 
                                  prev * itemsPerPage < totalUsers ? prev + 1 : prev
                                )
                              }
                              disabled={currentPage * itemsPerPage >= totalUsers}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {TransactionsTabContent()}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
