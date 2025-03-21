import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer, Share2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TransactionReceipt = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.transaction) {
      setTransaction(location.state.transaction);
      setIsLoading(false);
      
      if (location.state.isNew) {
        const transactionData = btoa(JSON.stringify(location.state.transaction));
        navigate(`/receipt/${transactionData}`, { replace: true, state: null });
      }
    } 
    else if (id) {
      try {
        const decodedData = JSON.parse(atob(id));
        setTransaction(decodedData);
      } catch (error) {
        console.error("Error decoding transaction:", error);
        toast.error("Invalid transaction data");
      } finally {
        setIsLoading(false);
      }
    }
  }, [id, location.state, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!receiptRef.current) return;

    html2canvas(receiptRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('transaction-receipt.pdf');
      
      toast.success("Receipt downloaded as PDF");
    });
  };

  const handleDownloadPNG = () => {
    if (!receiptRef.current) return;

    html2canvas(receiptRef.current).then(canvas => {
      const link = document.createElement('a');
      link.download = 'transaction-receipt.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Receipt downloaded as PNG");
    });
  };

  const handleShare = async () => {
    if (!receiptRef.current) return;

    try {
      html2canvas(receiptRef.current).then(async canvas => {
        canvas.toBlob(async blob => {
          if (!blob) return;
          
          if (navigator.share) {
            const file = new File([blob], 'transaction-receipt.png', { type: 'image/png' });
            await navigator.share({
              title: 'Transaction Receipt',
              text: 'Here is my transaction receipt from Momo Quickpay',
              files: [file]
            });
          } else {
            toast.error("Sharing is not supported on this browser");
          }
        });
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share receipt");
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#070058]"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Receipt</h1>
          <p className="mt-2 text-gray-600">The receipt data is invalid or has expired.</p>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={handleBack}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'send':
        return 'Money Transfer';
      case 'airtime':
        return 'Airtime Purchase';
      case 'data':
        return 'Data Bundle Purchase';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const formatDate = (dateString: string, timestamp: number) => {
    const date = new Date(timestamp);
    return `${dateString} - ${date.toLocaleTimeString()}`;
  };

  const getRecipientDisplay = () => {
    switch (transaction.type) {
      case 'send':
        return transaction.to || transaction.recipient;
      case 'airtime':
      case 'data':
        return transaction.phoneNumber || transaction.recipient;
      default:
        return transaction.recipient || 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="outline" 
              onClick={handlePrint}
              title="Print Receipt"
            >
              <Printer size={16} />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={handleShare}
              title="Share Receipt"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </div>
        
        <Card className="shadow-lg print:shadow-none">
          <CardContent className="p-0">
            <div 
              ref={receiptRef} 
              className="bg-white p-6 rounded-lg"
            >
              <div className="flex justify-center mb-6">
                <img 
                  src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png" 
                  alt="Momo Quickpay Logo" 
                  className="w-24 h-24 rounded-full"
                />
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-[#070058]">Momo Quickpay</h2>
                <p className="text-gray-500">Transaction Receipt</p>
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Success
                  </span>
                </div>
              </div>
              
              <div className="border-t border-dashed pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction Type:</span>
                    <span className="font-medium">{formatTransactionType(transaction.type)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recipient:</span>
                    <span className="font-medium">{getRecipientDisplay()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-bold text-[#070058]">{transaction.amount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{formatDate(transaction.date, transaction.timestamp)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference:</span>
                    <span className="font-medium">MQP-{Math.floor(transaction.timestamp / 1000)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 border-t border-dashed pt-6 text-center">
                <p className="text-gray-500 text-sm">Thank you for using Momo Quickpay</p>
                <p className="text-gray-400 text-xs mt-1">This receipt serves as proof of transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleDownloadPNG}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Save as PNG
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-[#070058] hover:bg-[#070058]/90"
          >
            <Download size={16} />
            Save as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;
