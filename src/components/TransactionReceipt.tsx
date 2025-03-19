
import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Send, Smartphone, Signal, Download, ArrowLeft, Printer } from "lucide-react";
import { Transaction } from "@/utils/transactionService";
import { useTransactions } from "@/hooks/useTransactions";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const getIcon = (type: Transaction["type"] | string) => {
  switch (type) {
    case "send":
      return <Send className="w-6 h-6 text-white" />;
    case "airtime":
      return <Smartphone className="w-6 h-6 text-white" />;
    case "data":
      return <Signal className="w-6 h-6 text-white" />;
    default:
      return <Send className="w-6 h-6 text-white" />;
  }
};

const getTitle = (type: Transaction["type"] | string) => {
  switch (type) {
    case "send":
      return "Send Money";
    case "airtime":
      return "Buy Airtime";
    case "data":
      return "Buy Data";
    default:
      return "Transaction";
  }
};

const getFormattedDate = (timestamp: number | string) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const TransactionReceipt = () => {
  const { id } = useParams<{ id: string }>();
  const { transactions } = useTransactions();
  const navigate = useNavigate();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Find the transaction by ID
  const transaction = transactions.find(t => 
    (t as any).id === id || // Supabase ID
    ((t as any).reference === id) || // Reference
    ((t as any).timestamp?.toString() === id) // Timestamp as string
  );

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
          <h1 className="text-xl font-bold text-[#070058] mb-4">Transaction Not Found</h1>
          <p className="mb-6 text-gray-600">The transaction receipt you're looking for could not be found.</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="w-full bg-[#070058]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const generatePDF = async () => {
    if (!receiptRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297] // A4
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${transaction.type}-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPNG = async () => {
    if (!receiptRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `receipt-${transaction.type}-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PNG:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const recipient = 'to' in transaction 
    ? transaction.to 
    : transaction.phoneNumber;
    
  const transactionType = transaction.type;
  const amount = transaction.amount;
  const timestamp = transaction.timestamp;
  const reference = (transaction as any).reference || `REF-${transaction.timestamp}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="flex ml-auto gap-2">
            <Button 
              variant="outline" 
              onClick={generatePDF} 
              disabled={isGenerating}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadPNG} 
              disabled={isGenerating}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" /> PNG
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.print()} 
              className="flex items-center print:hidden"
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>
        
        <div 
          ref={receiptRef} 
          className="bg-white p-8 rounded-2xl shadow-md mb-8"
        >
          {/* Logo and Header */}
          <div className="flex flex-col items-center mb-8 border-b pb-4">
            <img src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png" alt="Momo Quickpay Logo" className="w-16 h-16 object-contain mb-2" />
            <h1 className="text-xl font-bold text-[#070058]">Momo Quickpay</h1>
            <p className="text-sm text-gray-500">Transaction Receipt</p>
          </div>
          
          {/* Transaction Icon and Type */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center mr-4">
              {getIcon(transactionType)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#070058]">{getTitle(transactionType)}</h2>
              <p className="text-sm text-gray-500">Transaction completed successfully</p>
            </div>
          </div>
          
          {/* Transaction Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b">
              <p className="text-gray-500">Date & Time</p>
              <p className="font-medium">{getFormattedDate(timestamp)}</p>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <p className="text-gray-500">Amount</p>
              <p className="font-bold text-lg text-[#070058]">{amount}</p>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <p className="text-gray-500">Recipient</p>
              <p className="font-medium">{recipient}</p>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <p className="text-gray-500">Transaction Type</p>
              <p className="font-medium">{getTitle(transactionType)}</p>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <p className="text-gray-500">Reference</p>
              <p className="font-medium">{reference}</p>
            </div>
            
            {'dataPackage' in transaction && transaction.dataPackage && (
              <div className="flex justify-between py-2 border-b">
                <p className="text-gray-500">Data Package</p>
                <p className="font-medium">{transaction.dataPackage}</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
            <p>Thank you for using Momo Quickpay</p>
            <p className="mt-1">For support: support@momoquickpay.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;
