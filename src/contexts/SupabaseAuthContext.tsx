
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

// Define Profile type from the Database types
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, username: string, fullName?: string, role?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Supabase is always configured since we're using the integrated client
  const [isConfigured] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    console.log('SupabaseAuthProvider: Initializing auth state');
    
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('SupabaseAuthProvider: Auth state change:', event, session ? 'Session exists' : 'No session');
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      // Always set loading to false after auth state change
      setLoading(false);
    });

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('SupabaseAuthProvider: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('SupabaseAuthProvider: Error getting session:', error);
        }
        
        if (!mounted) return;
        
        console.log('SupabaseAuthProvider: Initial session:', session ? 'Found' : 'None');
        
        // Only update state if there's no session from the auth state change listener
        if (!session) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('SupabaseAuthProvider: Error in initializeAuth:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      console.log('SupabaseAuthProvider: Loading profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('SupabaseAuthProvider: Error loading profile:', error);
      } else {
        console.log('SupabaseAuthProvider: Profile loaded:', profile ? 'Success' : 'Not found');
        setProfile(profile);
      }
    } catch (error) {
      console.error('SupabaseAuthProvider: Error in loadProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName?: string, role?: string) => {
    setLoading(true);
    try {
      console.log('Attempting signup with:', { email, username, fullName, role });
      
      const redirectUrl = `${window.location.origin}/`;
      
      // Ensure role is a valid enum value
      const validRoles = ['dj', 'fan', 'promoter', 'venue', 'sub_promoter'];
      const userRole = role && validRoles.includes(role) ? role : 'fan';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username,
            full_name: fullName || '',
            role: userRole
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (data.user && !data.session) {
        toast.success('Account created successfully! Please check your email to verify.');
      } else if (data.session) {
        toast.success('Account created and signed in successfully!');
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create account');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Welcome back!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign in');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.info('Signed out successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign out');
      }
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
