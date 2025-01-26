import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const QRScanner = () => {
  const [amount, setAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleBarCodeScanned = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      if (!amount) {
        toast.error('Please enter an amount first');
        return;
      }

      const ussdCode = parsedData.type === 'account'
        ? `tel:*182*1*1*${parsedData.code}*${amount}%23`
        : `tel:*182*8*1*${parsedData.code}*${amount}%23`;

      window.location.href = ussdCode;
    } catch (error) {
      toast.error('Invalid QR code');
    }
  };

  const handleStartScanning = () => {
    if (!amount) {
      toast.error('Please enter an amount first');
      return;
    }

    if (!/^\d+$/.test(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsScanning(true);
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    html5QrcodeScanner.render(
      (data) => {
        handleBarCodeScanned(data);
        html5QrcodeScanner.clear();
      },
      (error) => {
        console.error(error);
      }
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-4 text-mtn-blue hover:text-mtn-blue/80"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {!isScanning ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (RWF)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleStartScanning}
            className="w-full bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue"
          >
            Start Scanning
          </Button>
        </div>
      ) : (
        <div id="qr-reader" className="w-full" />
      )}
    </div>
  );
};

export default QRScanner;