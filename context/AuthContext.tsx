
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppUser, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    authError: string | null;
    login: (user: AppUser) => void;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const fetchProfile = async (userId: string, email?: string) => {
        try {
            console.log('Fetching profile for:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Profile fetch error:', error.message);
                return { profile: null, error: error.message };
            }

            if (data) {
                const appUser: AppUser = {
                    id: data.id,
                    username: data.cpf || data.full_name,
                    name: data.full_name,
                    email: email,
                    role: data.role as UserRole,
                    schoolId: data.school_id,
                };
                return { profile: appUser, error: null };
            }
        } catch (err: any) {
            console.error('Unexpected error fetching profile:', err);
            return { profile: null, error: err.message };
        }
        return { profile: null, error: 'Usuário não encontrado' };
    };

    const login = (loggedInUser: AppUser) => {
        setUser(loggedInUser);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const refreshProfile = async () => {
        if (user) {
            const profile = await fetchProfile(user.id, user.email);
            if (profile) setUser(profile);
        }
    };

    useEffect(() => {
        let mounted = true;

        const handleAuthChange = async (session: any) => {
            console.log('Auth state change detected. Session:', session ? 'Present' : 'None');
            setAuthError(null);

            try {
                if (session?.user) {
                    const { profile, error: profileError } = await fetchProfile(session.user.id, session.user.email);
                    if (mounted) {
                        if (profile) {
                            setUser(profile);
                        } else {
                            setAuthError(profileError || 'Perfil não encontrado. Verifique se o usuário existe na tabela profiles.');
                            setUser(null);
                        }
                    }
                } else {
                    if (mounted) setUser(null);
                }
            } catch (err: any) {
                console.error('Error in handleAuthChange:', err);
                if (mounted) {
                    setAuthError('Erro ao carregar seu perfil: ' + err.message);
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    console.log('Setting loading to false');
                    setLoading(false);
                }
            }
        };

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuthChange(session);
        });

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                if (session) {
                    handleAuthChange(session);
                } else {
                    setLoading(false);
                }
            }
        }).catch(err => {
            console.error('Initial session fetch failed:', err);
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, authError, login, logout, refreshProfile }}>
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
