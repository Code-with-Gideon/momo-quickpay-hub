import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QRCodeGenerator = () => {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'account' | 'momopay'>('account');

  const generateQRData = () => {
    const data = {
      type,
      code,
      redirectUrl: window.location.origin,
    };
    return JSON.stringify(data);
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

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {type === 'account' ? 'Account Number' : 'MomoPay Code'}
          </label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Enter ${type === 'account' ? 'account number' : 'MomoPay code'}`}
            type="number"
            className="w-full"
          />
        </div>

        <div className="flex gap-3">
          <Button
            className={`flex-1 ${
              type === 'account' ? 'bg-mtn-yellow text-mtn-blue' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setType('account')}
          >
            Account Number
          </Button>
          <Button
            className={`flex-1 ${
              type === 'momopay' ? 'bg-mtn-yellow text-mtn-blue' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => setType('momopay')}
          >
            MomoPay Code
          </Button>
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