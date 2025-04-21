
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [updatePasswordMode, setUpdatePasswordMode] = useState(false);
  const [phoneVerificationMode, setPhoneVerificationMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { resetPassword, updatePassword, requestPhoneVerification, verifyPhone } = useAuth();

  // Check for reset password mode based on URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isReset = params.get("reset") === "true";
    const hasType = params.get("type") === "recovery";
    
    if (isReset || hasType) {
      setUpdatePasswordMode(true);
    }
  }, [location]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            phone_number: phoneNumber,
          },
          emailRedirectTo: window.location.origin + '/auth',
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (phoneNumber) {
        // If phone number is provided, switch to phone verification mode
        toast({
          title: "Verification Required",
          description: "We've sent a verification code to your phone. Please verify your number.",
        });
        
        // Request phone verification
        await requestPhoneVerification(phoneNumber);
        setPhoneVerificationMode(true);
      } else {
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
        
        // Auto-sign in after signup
        if (data.user) {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await resetPassword(email);
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link.",
      });
      
      // Switch back to login
      setResetPasswordMode(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await updatePassword(password);
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      // Redirect to login
      setUpdatePasswordMode(false);
      navigate("/auth");
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code sent to your phone.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await verifyPhone(phoneNumber, verificationCode);
      
      toast({
        title: "Phone verified",
        description: "Your phone number has been verified successfully.",
      });
      
      // Redirect to dashboard after verification
      navigate("/dashboard");
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify phone number.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendPhoneVerification = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Phone number is required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await requestPhoneVerification(phoneNumber);
      
      toast({
        title: "Verification code sent",
        description: "A new verification code has been sent to your phone.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#070058]">
            Momo Quickpay
          </CardTitle>
        </CardHeader>
        <CardContent>
          {updatePasswordMode ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-4">Set New Password</h2>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button 
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#070058] hover:bg-[#0a008c]"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating password..." : "Update Password"}
                </Button>
              </form>
            </div>
          ) : resetPasswordMode ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#070058] hover:bg-[#0a008c]"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending reset link..." : "Send Reset Link"}
                </Button>
                
                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    onClick={() => setResetPasswordMode(false)}
                    className="text-[#070058] hover:text-[#0a008c]"
                    type="button"
                  >
                    Back to login
                  </Button>
                </div>
              </form>
            </div>
          ) : phoneVerificationMode ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-4">Verify Phone Number</h2>
              <form onSubmit={handlePhoneVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div className="font-medium">{phoneNumber}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#070058] hover:bg-[#0a008c]"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Phone Number"}
                </Button>
                
                <div className="text-center pt-2">
                  <Button
                    variant="link"
                    onClick={resendPhoneVerification}
                    className="text-[#070058] hover:text-[#0a008c]"
                    type="button"
                    disabled={isLoading}
                  >
                    Resend verification code
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Tabs 
              defaultValue="signin" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button 
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="link"
                      onClick={() => setResetPasswordMode(true)}
                      className="text-[#070058] p-0 h-auto hover:text-[#0a008c]"
                      type="button"
                    >
                      Forgot Password?
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#070058] hover:bg-[#0a008c] mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : (
                      <span className="flex items-center">
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="Your phone number (with country code)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Format: +250xxxxxxxxx (include country code)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <button 
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#070058] hover:bg-[#0a008c]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : (
                      <span className="flex items-center">
                        Sign Up
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
