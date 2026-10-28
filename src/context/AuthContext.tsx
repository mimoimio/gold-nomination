// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import pb from '../lib/pocketbase';
import type { UserRecord } from '../types/database';

interface AuthContextType {
    user: UserRecord | null;
    isValid: boolean;
    isAdmin: boolean;
    isPewasiat: boolean;
    isWasi: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isValid: false,
    isAdmin: false,
    isPewasiat: false,
    isWasi: false
});

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

    // Derived state for clean role-based routing and rendering
    const isAdmin = user?.role === 'admin';
    console.log("user?.role", user?.role)
    const isPewasiat = user?.role === 'pewasiat';
    const isWasi = user?.role === 'wasi';

    return (
        <AuthContext.Provider value={{ user, isValid, isAdmin, isPewasiat, isWasi }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);