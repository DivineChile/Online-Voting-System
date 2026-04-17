import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';
import { supabase } from '../lib/supabase';
import { fetchCurrentUser } from '../api/authApi';

function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAuthenticatedUser(currentSession) {
    try {
      if (!currentSession?.access_token) {
        setProfile(null);
        return;
      }

      const result = await fetchCurrentUser(currentSession.access_token);
      setProfile(result.data.profile);
    } catch (error) {
      console.error('Failed to load authenticated user:', error);
      setProfile(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!isMounted) return;

        const currentSession = data.session ?? null;
        setSession(currentSession);

        if (currentSession) {
          await loadAuthenticatedUser(currentSession);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession ?? null);

      if (newSession) {
        await loadAuthenticatedUser(newSession);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setSession(null);
    setProfile(null);
  }

  const value = useMemo(() => {
    return {
      session,
      profile,
      loading,
      isAuthenticated: !!session,
      signIn,
      signOut,
    };
  }, [session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;