
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import UserMenu from "@/components/UserMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Download, ChevronLeft, ChevronRight, BarChart, Users, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTransactions } from "@/hooks/useTransactions";

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
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionType | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editRecipient, setEditRecipient] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const itemsPerPage = 10;
  
  // Use our enhanced useTransactions hook for all transaction-related operations
  const { 
    transactions, 
    isLoading: isLoadingTransactions, 
    updateTransaction, 
    deleteTransaction, 
    refreshTransactions 
  } = useTransactions({ 
    userId: selectedUser || undefined,
    isAdmin: true,
    refreshInterval: 0 // Don't auto-refresh
  });

  const fetchDashboardData = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoadingUsers(true);
    try {
      const { data: transData, error: transError } = await supabase
        .from('admin_transaction_view')
        .select('*');

      if (transError) {
        console.error('Error fetching transactions:', transError);
      } else if (transData) {
        setTotalTransactions(transData.length);
        const total = transData.reduce((sum, trans) => sum + (trans.amount || 0), 0);
        setTotalAmount(total);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .ilike('display_name', `%${searchTerm}%`);

      setTotalUsers(count || 0);

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
      setIsLoadingUsers(false);
    }
  }, [isAdmin, currentPage, searchTerm]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // When a user is selected, switch to the transactions tab
  const handleUserSelect = (userId: string) => {
    if (userId === selectedUser) {
      setSelectedUser(null);
      setActiveTab("users");
    } else {
      setSelectedUser(userId);
      setActiveTab("transactions");
      console.log("Selected user:", userId);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDownloadCSV = () => {
    const csvData = selectedUser ? 
      [
        ['ID', 'Type', 'Amount', 'Recipient', 'Description', 'Status', 'Date'],
        ...transactions.map((t: any) => [
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

  const handleEditTransaction = (transaction: TransactionType) => {
    console.log("Editing transaction:", transaction);
    setEditingTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditRecipient(transaction.recipient);
    setEditDescription(transaction.description || '');
    setEditStatus(transaction.status);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    
    const updates = {
      amount: parseFloat(editAmount),
      recipient: editRecipient,
      description: editDescription || null,
      status: editStatus
    };
    
    console.log("Saving edited transaction:", {
      id: editingTransaction.id,
      ...updates
    });
    
    try {
      await updateTransaction(editingTransaction.id, updates);
      toast.success("Transaction updated successfully");
      setIsEditDialogOpen(false);
      if (selectedUser) {
        refreshTransactions();
      }
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast.error("Failed to update transaction: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return;
    }
    
    console.log("Deleting transaction:", transactionId);
    
    try {
      await deleteTransaction(transactionId);
      toast.success("Transaction deleted successfully");
      if (selectedUser) {
        refreshTransactions();
      }
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast.error("Failed to delete transaction: " + (error.message || "Unknown error"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Map the transactions from the hook format to the format expected by the component
  const transactionsList = transactions.map((t: any) => ({
    id: t.id || t.userId + t.timestamp,
    user_id: t.userId,
    display_name: t.displayName,
    email: t.email,
    phone_number: t.phoneNumber,
    amount: parseFloat(String(t.amount).replace(/[^0-9.]/g, "")),
    transaction_type: t.type,
    recipient: t.type === 'send' ? t.to : (t.phoneNumber || ''),
    description: t.type === 'data' ? t.dataPackage : null,
    status: 'completed',
    created_at: new Date(t.timestamp).toISOString()
  })) as TransactionType[];

  // Use this effect to monitor the transactions list for debugging
  useEffect(() => {
    console.log('Current transactions list:', transactionsList.length, 'items');
  }, [transactionsList.length]);

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
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="transactions" disabled={!selectedUser}>
                  User Transactions {selectedUser ? `(${transactionsList.length})` : ''}
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
                    {isLoadingUsers ? (
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
              
              <TabsContent value="transactions">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>User Transactions</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setActiveTab("users");
                        // Don't clear selectedUser here to prevent losing transaction data
                      }}>
                        Back to Users
                      </Button>
                      <Button variant="outline" onClick={handleDownloadCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          console.log("Manual refresh triggered");
                          refreshTransactions();
                        }}
                      >
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedUser ? (
                      isLoadingTransactions ? (
                        <div className="py-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#070058] mx-auto"></div>
                          <p className="mt-2 text-gray-500">Loading transactions...</p>
                        </div>
                      ) : transactionsList.length === 0 ? (
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
                              {transactionsList.map((transaction) => (
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
                                        onClick={() => handleEditTransaction(transaction)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => handleDeleteTransaction(transaction.id)}
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
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="amount" className="text-right text-sm">
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="col-span-3"
                min="100"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="recipient" className="text-right text-sm">
                Recipient
              </label>
              <Input
                id="recipient"
                value={editRecipient}
                onChange={(e) => setEditRecipient(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm">
                Description
              </label>
              <Input
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm">
                Status
              </label>
              <select
                id="status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
