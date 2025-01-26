import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QRCodeGenerator = () => {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'account' | 'momopay'>('account');
  const navigate = useNavigate();

  const generateQRData = () => {
    const data = {
      type,
      code,
      redirectUrl: 'https://momo-quickpay-hub.lovable.app/',
    };
    return JSON.stringify(data);
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

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            {type === 'account' ? 'Account Number' : 'MomoPay Code'}
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Enter ${type === 'account' ? 'account number' : 'MomoPay code'}`}
            type="number"
          />
        </div>

        <div className="flex gap-3">
          <button
            className={`flex-1 h-10 rounded-lg ${
              type === 'account' ? 'bg-[#FFCB05] text-[#003366] font-semibold' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setType('account')}
          >
            Account Number
          </button>
          <button
            className={`flex-1 h-10 rounded-lg ${
              type === 'momopay' ? 'bg-[#FFCB05] text-[#003366] font-semibold' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setType('momopay')}
          >
            MomoPay Code
          </button>
        </div>

        {code && (
          <div className="flex justify-center mt-6">
            <QRCodeSVG
              value={generateQRData()}
              size={200}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;