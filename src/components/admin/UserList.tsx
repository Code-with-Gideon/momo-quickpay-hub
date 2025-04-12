
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserType {
  id: string;
  email: string;
  display_name: string | null;
  phone_number: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

interface UserListProps {
  users: UserType[];
  isLoading: boolean;
  selectedUser: string | null;
  searchTerm: string;
  currentPage: number;
  totalUsers: number;
  itemsPerPage: number;
  onUserSelect: (userId: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageChange: (page: number) => void;
  onDownloadCSV: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  selectedUser,
  searchTerm,
  currentPage,
  totalUsers,
  itemsPerPage,
  onUserSelect,
  onSearchChange,
  onPageChange,
  onDownloadCSV
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
      <CardHeader className="pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>All Users</CardTitle>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={onSearchChange}
                className="pl-8 w-full md:w-[180px]"
              />
            </div>
            <Button variant="outline" onClick={onDownloadCSV}>
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
                          onClick={() => onUserSelect(user.id)}
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
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => 
                    onPageChange(
                      currentPage * itemsPerPage < totalUsers ? currentPage + 1 : currentPage
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
  );
};

export default UserList;
