import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
    id: string;
    name: string;
    email: string;
    cpf?: string;
    role: string;
    federationYear?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('vinidev_token');
        if (token) {
            api.get('/auth/me').then(res => {
                setUser(res.data);
            }).catch(() => {
                localStorage.removeItem('vinidev_token');
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('vinidev_token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('vinidev_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
