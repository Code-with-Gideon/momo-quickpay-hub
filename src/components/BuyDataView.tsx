import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BuyDataViewProps {
  onBack: () => void;
}

interface DataPlan {
  id: string;
  name: string;
  duration: string;
  category: "hot" | "daily" | "weekly" | "monthly";
  price: number;
  features: string[];
}

const allPlans: DataPlan[] = [
  {
    id: "1",
    name: "200MB",
    duration: "24hrs",
    category: "daily",
    price: 100,
    features: ["200MB / 24hrs"]
  },
  {
    id: "2",
    name: "500MB",
    duration: "24hrs",
    category: "daily",
    price: 200,
    features: ["500MB / 24hrs"]
  },
  {
    id: "3",
    name: "8GB + 800Mins",
    duration: "7 days",
    category: "weekly",
    price: 3000,
    features: ["8GB + 800Mins", "+ 30 SMS"]
  },
  {
    id: "4",
    name: "7GB",
    duration: "Mon to Fri",
    category: "weekly",
    price: 1000,
    features: ["7GB (Mon to Fri)", "+ 30 SMS"]
  },
  {
    id: "5",
    name: "1GB Per Day",
    duration: "30 days",
    category: "monthly",
    price: 5000,
    features: ["1GB Per Day", "+ 200 SMS"]
  }
];

const dataPlansByCategory: Record<string, DataPlan[]> = {
  hot: allPlans,
  daily: allPlans.filter(plan => plan.category === "daily"),
  weekly: allPlans.filter(plan => plan.category === "weekly"),
  monthly: allPlans.filter(plan => plan.category === "monthly")
};

const BuyDataView = ({ onBack }: BuyDataViewProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [recentNumbers, setRecentNumbers] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("hot");

  useEffect(() => {
    const stored = localStorage.getItem("recent_data_numbers");
    if (stored) {
      setRecentNumbers(JSON.parse(stored));
    }
  }, []);

  const handlePhoneNumberChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
  };

  const handlePlanSelection = (plan: DataPlan) => {
    toast.info("Service temporarily unavailable", {
      description: "The data purchase service is currently undergoing maintenance.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#070058] h-[120px] relative overflow-hidden">
        <img 
          src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png" 
          alt="Banner Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-70" 
        />
        <div className="relative z-10 px-4 py-6">
          <button onClick={onBack} className="text-white flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-white font-bold text-2xl text-center">Buy Data</h1>
        </div>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Service Notice</h3>
              <p className="text-white/90 text-xs">Data purchase is temporarily unavailable</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-[30px]">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[#070058] text-lg font-semibold block">Enter Phone Number</label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="07xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                className="h-12 bg-gray-50 rounded-xl text-base placeholder:text-gray-400 border-0 pr-24"
                disabled
              />
              {recentNumbers.length > 0 && (
                <Select value={phoneNumber} onValueChange={setPhoneNumber} disabled>
                  <SelectTrigger className="absolute right-0 top-0 h-12 w-24 bg-transparent border-0 hover:bg-gray-100 rounded-r-xl transition-colors">
                    Recent
                  </SelectTrigger>
                  <SelectContent>
                    {recentNumbers.map(number => (
                      <SelectItem key={number} value={number}>
                        {number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Tabs defaultValue="hot" className="w-full" onValueChange={setSelectedTab}>
            <TabsList className="w-full grid grid-cols-4 gap-4 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="hot" 
                className="data-[state=active]:bg-[#070058] data-[state=active]:text-white border rounded-lg py-2"
                disabled
              >
                Hot Deals
              </TabsTrigger>
              <TabsTrigger 
                value="daily" 
                className="data-[state=active]:bg-[#070058] data-[state=active]:text-white border rounded-lg py-2"
                disabled
              >
                Daily
              </TabsTrigger>
              <TabsTrigger 
                value="weekly" 
                className="data-[state=active]:bg-[#070058] data-[state=active]:text-white border rounded-lg py-2"
                disabled
              >
                Weekly
              </TabsTrigger>
              <TabsTrigger 
                value="monthly" 
                className="data-[state=active]:bg-[#070058] data-[state=active]:text-white border rounded-lg py-2"
                disabled
              >
                Monthly
              </TabsTrigger>
            </TabsList>

            {Object.entries(dataPlansByCategory).map(([category, plans]) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => handlePlanSelection(plan)}
                      className="bg-gray-50 rounded-xl p-4 text-center space-y-2 hover:bg-gray-100 transition-colors opacity-70 cursor-not-allowed"
                      disabled
                    >
                      <div className="text-xs text-gray-500 capitalize">{plan.category}</div>
                      <div className="space-y-1">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="text-[#070058] font-semibold">
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="text-[#070058] font-bold mt-2">
                        RWF {plan.price.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BuyDataView;
