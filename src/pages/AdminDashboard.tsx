
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import UserMenu from "@/components/UserMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useTransactions } from "@/hooks/useTransactions";

// Import refactored components
import DashboardMetrics from "@/components/admin/DashboardMetrics";
import UserList from "@/components/admin/UserList";
import TransactionList from "@/components/admin/TransactionList";
import TransactionEdit from "@/components/admin/TransactionEdit";
import AccessDenied from "@/components/admin/AccessDenied";

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

  console.log("AdminDashboard - Selected User:", selectedUser);
  console.log("AdminDashboard - Transactions count:", transactions.length);

  const fetchDashboardData = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoadingUsers(true);
    try {
      // Fetch dashboard summary data
      const { data: transData, error: transError } = await supabase
        .from('admin_transaction_view')
        .select('*');

      if (transError) {
        console.error('Error fetching transactions summary:', transError);
      } else if (transData) {
        setTotalTransactions(transData.length);
        const total = transData.reduce((sum, trans) => sum + (trans.amount || 0), 0);
        setTotalAmount(total);
      }

      // Fetch users with pagination
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
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isAdmin, currentPage, searchTerm]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // When a user is selected, switch to the transactions tab
  const handleUserSelect = (userId: string) => {
    console.log("Selecting user:", userId);
    
    if (userId === selectedUser) {
      console.log("Deselecting user");
      setSelectedUser(null);
      setActiveTab("users");
    } else {
      console.log("Setting selected user and switching to transactions tab");
      setSelectedUser(userId);
      setActiveTab("transactions");
    }
  };

  // Explicitly refresh transactions when the tab changes to transactions
  useEffect(() => {
    if (activeTab === "transactions" && selectedUser) {
      console.log("Tab changed to transactions, refreshing data for userId:", selectedUser);
      refreshTransactions();
    }
  }, [activeTab, selectedUser, refreshTransactions]);

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
          t.transaction_type || t.type,
          t.amount,
          t.recipient || t.to || t.phoneNumber || '',
          t.description || t.dataPackage || '',
          t.status || 'completed',
          new Date(t.created_at || t.timestamp).toLocaleString()
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
    console.log('Raw transactions from hook:', transactions.length, 'items');
  }, [transactionsList.length, transactions.length]);

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
          <AccessDenied />
        ) : (
          <div className="space-y-6">
            <DashboardMetrics
              totalUsers={totalUsers}
              totalTransactions={totalTransactions}
              totalAmount={totalAmount}
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="transactions" disabled={!selectedUser}>
                  User Transactions {selectedUser ? `(${transactionsList.length})` : ''}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="users">
                <UserList
                  users={users}
                  isLoading={isLoadingUsers}
                  selectedUser={selectedUser}
                  searchTerm={searchTerm}
                  currentPage={currentPage}
                  totalUsers={totalUsers}
                  itemsPerPage={itemsPerPage}
                  onUserSelect={handleUserSelect}
                  onSearchChange={handleSearchChange}
                  onPageChange={setCurrentPage}
                  onDownloadCSV={handleDownloadCSV}
                />
              </TabsContent>
              
              <TabsContent value="transactions">
                <TransactionList
                  transactions={transactionsList}
                  isLoading={isLoadingTransactions}
                  selectedUser={selectedUser}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onDownloadCSV={handleDownloadCSV}
                  onRefresh={refreshTransactions}
                  onBackToUsers={() => setActiveTab("users")}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <TransactionEdit
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editAmount={editAmount}
        setEditAmount={setEditAmount}
        editRecipient={editRecipient}
        setEditRecipient={setEditRecipient}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default AdminDashboard;
