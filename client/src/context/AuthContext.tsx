import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    login: (jwt: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const login = (jwt: string) => {
        localStorage.setItem('token', jwt);
        setToken(jwt);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    // memoized the object to prevent recreation if parent of AuthProvider re-rendered.
    const value = useMemo(() => ({ token, login, logout }), [token]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// custom hook to cleanly consume the auth state
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};