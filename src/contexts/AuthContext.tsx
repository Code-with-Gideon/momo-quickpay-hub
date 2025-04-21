
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  verifyPhone: (phone: string, code: string) => Promise<void>;
  requestPhoneVerification: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  verifyPhone: async () => {},
  requestPhoneVerification: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Admin email constant
const ADMIN_EMAIL = "company.qpay@gmail.com";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Handle hash fragments from password reset links on initial load
    const handleHashParams = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
        try {
          // Extract the access token from the hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            // Set the access token in the session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (error) {
              console.error("Error setting session from hash params:", error);
            } else if (data.session) {
              setSession(data.session);
              setUser(data.session.user);
              checkAdminStatus(data.session.user.email || "");
              
              // Redirect to the password reset page
              window.location.href = '/auth?reset=true';
            }
          }
        } catch (error) {
          console.error("Error processing hash params:", error);
        }
      }
    };

    // Process hash parameters first
    handleHashParams();
    
    // Fetch the initial session
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
      checkAdminStatus(data.session?.user?.email || "");
      setIsLoading(false);
      
      // Also fetch profile data if user is authenticated
      if (data.session?.user) {
        fetchProfileData(data.session.user.id);
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      checkAdminStatus(newSession?.user?.email || "");
      setIsLoading(false);

      // Also fetch profile data if user is authenticated
      if (newSession?.user) {
        fetchProfileData(newSession.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if email is the specific admin email
  const checkAdminStatus = (email: string) => {
    setIsAdmin(email === ADMIN_EMAIL);
  };

  // Fetch profile data to ensure it exists
  const fetchProfileData = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      console.log('Profile data fetched:', data);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth?reset=true',
    });
    
    if (error) {
      throw error;
    }
  };
  
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      throw error;
    }
  };

  // Updated phone verification functions with proper logging
  
  // Function to request phone verification - improved with enhanced logging
  const requestPhoneVerification = async (phone: string) => {
    try {
      console.log("Requesting phone verification for:", phone);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true,
          channel: 'sms',
          data: {
            phone_verified: false
          }
        }
      });
      
      console.log("Phone verification request response:", { data, error });
      
      if (error) {
        console.error("Phone verification request error:", error);
        throw error;
      }
      
      console.log("Phone verification request successful");
      return data;
    } catch (error) {
      console.error("Error requesting phone verification:", error);
      throw error;
    }
  };

  // Function to verify phone with code - improved with better logging
  const verifyPhone = async (phone: string, code: string) => {
    try {
      console.log("Verifying phone:", phone, "with code:", code);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: 'sms'
      });
      
      console.log("Phone verification response:", { data, error });
      
      if (error) {
        console.error("Phone verification error:", error);
        throw error;
      }
      
      // Update user metadata to indicate phone is verified
      if (data?.user) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { phone_verified: true }
        });
        
        if (updateError) {
          console.error("Error updating user metadata:", updateError);
        }
      }
      
      console.log("Phone verification successful");
      return data;
    } catch (error) {
      console.error("Error verifying phone:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      isAdmin, 
      isLoading, 
      signOut, 
      resetPassword,
      updatePassword,
      verifyPhone,
      requestPhoneVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};
