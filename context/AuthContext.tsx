
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppUser, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
    user: AppUser | null;
    login: (user: AppUser) => void;
    logout: () => void;
    users: AppUser[]; // Keeping users in Auth for login check
    setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);

    const login = (loggedInUser: AppUser) => {
        setUser(loggedInUser);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, users, setUsers }}>
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
