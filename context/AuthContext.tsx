
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppUser, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    login: (user: AppUser) => void;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const email = session?.user?.email;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            if (data) {
                const appUser: AppUser = {
                    id: data.id,
                    username: data.cpf || data.full_name, // Fallback
                    name: data.full_name,
                    email: email || undefined,
                    role: data.role as UserRole,
                    schoolId: data.school_id,
                    // Map other fields if necessary
                };
                return appUser;
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
        }
        return null;
    };

    useEffect(() => {
        // Check active sessions and sets the user
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                setUser(profile);
            }
            setLoading(false);
        };

        initAuth();

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                setUser(profile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = (loggedInUser: AppUser) => {
        setUser(loggedInUser);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const refreshProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setUser(profile);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
