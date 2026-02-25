import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate checking if a user is already logged in (Local Storage could be used, but for now we keep it simple)
        const savedUser = localStorage.getItem('wingman_user');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const loginWithEmail = async (email, password) => {
        // Mock instant login
        const mockUser = {
            uid: '12345mock',
            email: email,
            displayName: email.split('@')[0],
            photoURL: ''
        };
        setCurrentUser(mockUser);
        localStorage.setItem('wingman_user', JSON.stringify(mockUser));
        return { user: mockUser };
    };

    const registerWithEmail = async (email, password, displayName) => {
        // Mock instant registration
        const mockUser = {
            uid: '12345mock_new',
            email: email,
            displayName: displayName || email.split('@')[0],
            photoURL: ''
        };
        setCurrentUser(mockUser);
        localStorage.setItem('wingman_user', JSON.stringify(mockUser));
        return { user: mockUser };
    };

    const updateUserProfile = async (displayName, photoURL) => {
        if (!currentUser) throw new Error("No hay usuario activo.");
        const updatedUser = { ...currentUser, displayName, photoURL };
        setCurrentUser(updatedUser);
        localStorage.setItem('wingman_user', JSON.stringify(updatedUser));
    };

    const logout = async () => {
        setCurrentUser(null);
        localStorage.removeItem('wingman_user');
    };

    const value = {
        currentUser,
        loginWithEmail,
        loginWithEmail,
        registerWithEmail,
        updateUserProfile,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
