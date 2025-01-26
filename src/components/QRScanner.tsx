import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [amount, setAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const handleBarCodeScanned = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      if (!amount) {
        alert('Please enter an amount first');
        return;
      }

      const ussdCode = parsedData.type === 'account'
        ? `tel:*182*1*1*${parsedData.code}*${amount}%23`
        : `tel:*182*8*1*${parsedData.code}*${amount}%23`;

      window.location.href = ussdCode;
    } catch (error) {
      alert('Invalid QR code');
    }
  };

  const handleStartScanning = () => {
    if (!amount) {
      alert('Please enter an amount first');
      return;
    }

    if (!/^\d+$/.test(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    setIsScanning(true);
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
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
    <div className="min-h-screen bg-white p-4">
      <button
        className="flex items-center mb-4 text-[#003366]"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} />
        <span className="ml-2">Back</span>
      </button>

      {!isScanning ? (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-600">
            Amount (RWF)
          </label>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleStartScanning}
            className="w-full h-12 bg-[#FFCB05] rounded-lg text-[#003366] font-semibold"
          >
            Start Scanning
          </button>
        </div>
      ) : (
        <div id="qr-reader" className="w-full" />
      )}
    </div>
  );
};

export default QRScanner;