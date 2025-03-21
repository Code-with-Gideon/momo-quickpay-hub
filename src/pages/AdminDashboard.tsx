
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Database, Download, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserMenu from "@/components/UserMenu";
import { supabase } from "@/integrations/supabase/client";

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// Format amount for display
const formatAmount = (amount: number) => {
  return `RWF ${amount.toFixed(2)}`;
};

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("transactions");

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (user && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    } else if (!user) {
      navigate("/auth");
    } else {
      fetchAllData();
    }
  }, [user, isAdmin, navigate]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch all transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('admin_transaction_view')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (transactionsError) {
        throw transactionsError;
      }
      
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) {
        throw usersError;
      }
      
      setAllTransactions(transactionsData || []);
      setAllUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        const escaped = (value === null || value === undefined) ? '' 
          : String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    // Create blob and download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${filename} successfully`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-6xl mx-auto px-4">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-[#070058]">
              Admin Dashboard
            </h1>
          </div>
          <UserMenu />
        </header>
        
        <Card className="shadow-md">
          <CardHeader className="bg-[#070058]/5 pb-2">
            <CardTitle className="text-xl font-semibold text-[#070058]">
              MoMo Quickpay System Analytics
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      allTransactions.length
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      allUsers.length
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      formatAmount(allTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions" className="flex gap-2">
                  <Database className="h-4 w-4" />
                  <span>All Transactions</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex gap-2">
                  <Users className="h-4 w-4" />
                  <span>All Users</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Button 
                    variant="outline"
                    onClick={() => exportToCSV(allTransactions, 'momo-quickpay-transactions.csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export to CSV
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={5}>
                              <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : allTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        allTransactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {formatDate(transaction.created_at)}
                            </TableCell>
                            <TableCell>
                              <span className={`capitalize ${
                                transaction.transaction_type === 'send' 
                                  ? 'text-blue-600' 
                                  : transaction.transaction_type === 'airtime'
                                    ? 'text-green-600'
                                    : 'text-purple-600'
                              }`}>
                                {transaction.transaction_type}
                              </span>
                            </TableCell>
                            <TableCell>
                              {transaction.display_name || transaction.email || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              {transaction.recipient}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatAmount(transaction.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Button 
                    variant="outline"
                    onClick={() => exportToCSV(allUsers, 'momo-quickpay-users.csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export to CSV
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Display Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell colSpan={4}>
                              <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : allUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        allUsers.map((user, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {user.display_name || 'Unnamed User'}
                            </TableCell>
                            <TableCell>
                              {user.email}
                            </TableCell>
                            <TableCell>
                              {user.phone_number || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {formatDate(user.created_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
