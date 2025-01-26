import React from 'react';
import { ScanIcon, Smartphone, QrCode, QrCodeIcon } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import QRScanner from '@/components/QRScanner';
import NumberInput from '@/components/NumberInput';
import MomoPayInput from '@/components/MomoPayInput';
import QRCodeGenerator from '@/components/QRCodeGenerator';

type PaymentMethod = "none" | "qr" | "number" | "momopay" | "generate";

const HomeScreen = () => {
  const navigate = useNavigate();

  const navigateToScreen = (screen: PaymentMethod) => {
    switch (screen) {
      case "qr":
        navigate('/scanner');
        break;
      case "number":
        navigate('/number');
        break;
      case "momopay":
        navigate('/momopay');
        break;
      case "generate":
        navigate('/generate');
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#003366] p-4">
      <h1 className="text-2xl font-bold text-white text-center mt-10 mb-8">
        Rwanda MOMO Pay
      </h1>
      
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigateToScreen("qr")}
          className="h-20 rounded-lg flex items-center justify-center gap-3 bg-[#FFCB05]"
        >
          <ScanIcon size={24} color="#003366" />
          <span className="text-lg font-semibold text-[#003366]">Scan QR Code</span>
        </button>
        
        <button
          onClick={() => navigateToScreen("number")}
          className="h-20 rounded-lg flex items-center justify-center gap-3 bg-white"
        >
          <Smartphone size={24} color="#003366" />
          <span className="text-lg font-medium text-[#003366]">Enter Number</span>
        </button>

        <button
          onClick={() => navigateToScreen("momopay")}
          className="h-20 rounded-lg flex items-center justify-center gap-3 bg-white"
        >
          <QrCode size={24} color="#003366" />
          <span className="text-lg font-medium text-[#003366]">MomoPay Code</span>
        </button>

        <button
          onClick={() => navigateToScreen("generate")}
          className="h-20 rounded-lg flex items-center justify-center gap-3 bg-white"
        >
          <QrCodeIcon size={24} color="#003366" />
          <span className="text-lg font-medium text-[#003366]">Generate Payment QR</span>
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/scanner" element={<QRScanner />} />
      <Route path="/number" element={<NumberInput onBack={() => window.history.back()} />} />
      <Route path="/momopay" element={<MomoPayInput onBack={() => window.history.back()} />} />
      <Route path="/generate" element={<QRCodeGenerator />} />
    </Routes>
  );
};

export default App;