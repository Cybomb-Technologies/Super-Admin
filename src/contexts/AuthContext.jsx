import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple mock user since the app seems to use localStorage directly anyway
        const token = localStorage.getItem("hrms_token");
        if (token) {
            setUser({ id: 1, name: "Admin" }); // Minimal mock
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        // Fallback for components that try to use it without provider
        return { user: { name: "Admin" }, loading: false };
    }
    return context;
};
