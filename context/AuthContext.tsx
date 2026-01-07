
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

            // 1. Fetch Basic Profile
            const profileRes = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (profileRes.error) {
                console.warn('Profile fetch error:', profileRes.error.message);
                return { profile: null, error: profileRes.error.message };
            }

            const profileData = profileRes.data;
            if (!profileData) {
                return { profile: null, error: 'Perfil não encontrado' };
            }

            const role = profileData.role as UserRole;
            let appUser: AppUser = {
                id: profileData.id,
                username: profileData.cpf || profileData.full_name,
                name: profileData.full_name,
                email: email,
                role: role,
                schoolId: profileData.school_id,
            };

            // 2. Populate studentData if role is STUDENT
            if (role === UserRole.STUDENT) {
                let student: any = null;

                // First attempt: search by ID
                const studentIdRes = await supabase
                    .from('students')
                    .select(`
                        *,
                        schools:schoolId (
                            name,
                            type
                        )
                    `)
                    .eq('id', userId)
                    .maybeSingle();

                student = studentIdRes.data;

                // Fallback: search by CPF
                if (!student && profileData.cpf) {
                    console.log('Student not found by ID, trying by CPF:', profileData.cpf);
                    const studentCpfRes = await supabase
                        .from('students')
                        .select(`
                            *,
                            schools:schoolId (
                                name,
                                type
                            )
                        `)
                        .eq('cpf', profileData.cpf)
                        .maybeSingle();

                    if (studentCpfRes.data) {
                        console.log('Student found by CPF!');
                        student = studentCpfRes.data;
                    }
                }

                if (student) {
                    const rawStudent = student as any;
                    appUser.studentData = {
                        id: student.id,
                        schoolId: student.schoolId || rawStudent.school_id,
                        fullName: student.fullName || rawStudent.full_name || profileData.full_name,
                        cpf: student.cpf || profileData.cpf,
                        photoUrl: student.photoUrl || rawStudent.photo_url || rawStudent.avatar_url || profileData.avatar_url,
                        course: student.course || rawStudent.course,
                        registrationNumber: student.registrationNumber || rawStudent.registration_number,
                        validUntil: student.validUntil || rawStudent.valid_until,
                        isActive: student.isActive !== undefined ? student.isActive : rawStudent.is_active,
                        schoolName: rawStudent.schools?.name || rawStudent.schools?.school_name || rawStudent.school_name || '',
                        schoolType: rawStudent.schools?.type || '',
                        birthDate: student.birthDate || rawStudent.birth_date || '',
                        email: student.email || rawStudent.email || email || '',
                        dependents: student.dependents || []
                    };
                } else {
                    console.warn('Student record NOT found for user:', userId);

                    let fallbackSchoolName = '';
                    if (profileData.school_id) {
                        const schoolRes = await supabase
                            .from('schools')
                            .select('name')
                            .eq('id', profileData.school_id)
                            .maybeSingle();
                        if (schoolRes.data) fallbackSchoolName = schoolRes.data.name;
                    }

                    appUser.studentData = {
                        id: profileData.id,
                        schoolId: profileData.school_id,
                        fullName: profileData.full_name,
                        cpf: profileData.cpf,
                        photoUrl: profileData.avatar_url,
                        course: (profileData as any).course || '',
                        registrationNumber: (profileData as any).registration_number || (profileData as any).registrationNumber || '',
                        validUntil: (profileData as any).valid_until || (profileData as any).validUntil || '',
                        isActive: profileData.is_active !== undefined ? profileData.is_active : true,
                        schoolName: fallbackSchoolName,
                        schoolType: '' as any,
                        birthDate: (profileData as any).birth_date || '',
                        email: email || '',
                        dependents: []
                    };
                }
            }

            console.log('Final appUser object built:', appUser);
            return { profile: appUser, error: null };

        } catch (err: any) {
            console.error('Unexpected error in fetchProfile:', err);
            return { profile: null, error: err.message };
        }
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
            if (profile) setUser(profile as any);
        }
    };

    useEffect(() => {
        let mounted = true;

        const handleAuthChange = async (session: any) => {
            console.log('Auth state change detected. Session:', session ? 'Present' : 'None');
            setAuthError(null);

            try {
                if (session?.user) {
                    const profileRes = await fetchProfile(session.user.id, session.user.email);
                    if (mounted) {
                        if (profileRes.profile) {
                            setUser(profileRes.profile);
                        } else {
                            setAuthError(profileRes.error || 'Perfil não encontrado. Verifique se o usuário existe na tabela profiles.');
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event);
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Password recovery event detected, redirecting to onboarding...');
                window.location.href = '/onboarding';
                return;
            }
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
