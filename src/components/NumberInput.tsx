import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface NumberInputProps {
  onBack: () => void;
  onSubmit: (number: string) => void;
}

const NumberInput = ({ onBack, onSubmit }: NumberInputProps) => {
  const [number, setNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!number) {
      toast.error("Please enter a phone number");
      return;
    }

    if (!/^07\d{8}$/.test(number)) {
      toast.error("Please enter a valid Rwanda phone number");
      return;
    }

    onSubmit(number);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 text-mtn-blue hover:text-mtn-blue/80"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="07xxxxxxxx"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue"
        >
          Continue to Payment
        </Button>
      </form>
    </div>
  );
};

export default NumberInput;