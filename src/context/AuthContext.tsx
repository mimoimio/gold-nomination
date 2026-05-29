// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react'
import pb from '../lib/pocketbase';
import type { UserRecord } from '../types/database';

interface AuthContextType {
    user: UserRecord | null;
    isValid: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isValid: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserRecord | null>(pb.authStore.model as UserRecord | null);
    const [isValid, setIsValid] = useState<boolean>(pb.authStore.isValid);

    useEffect(() => {
        // Listen to changes in the Auth Store (login/logout)
        const unsubscribe = pb.authStore.onChange((_token, model) => {
            setUser(model as UserRecord | null);
            setIsValid(pb.authStore.isValid);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, isValid }
        }>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);