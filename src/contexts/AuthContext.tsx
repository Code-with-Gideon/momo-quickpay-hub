
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
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
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
  
  // New function to update password after reset
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
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
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
