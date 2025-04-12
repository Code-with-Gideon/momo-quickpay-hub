
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users } from "lucide-react";

interface DashboardMetricsProps {
  totalUsers: number;
  totalTransactions: number;
  totalAmount: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalUsers,
  totalTransactions,
  totalAmount
}) => {
  return (
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
  );
};

export default DashboardMetrics;
