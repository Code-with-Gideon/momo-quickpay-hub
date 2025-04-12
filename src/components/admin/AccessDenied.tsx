
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-4">You don't have permission to view this page.</p>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </CardContent>
    </Card>
  );
};

export default AccessDenied;
