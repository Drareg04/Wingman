import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    updateProfile 
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithEmail = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const registerWithEmail = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(userCredential.user, {
                displayName: displayName
            });
            // Update local state to reflect the new displayName immediately
            setCurrentUser({ ...userCredential.user, displayName });
        }
        return userCredential;
    };

    const updateUserProfile = async (displayName, photoURL, email) => {
        if (!auth.currentUser) throw new Error("No hay usuario activo.");
        
        await updateProfile(auth.currentUser, { 
            displayName: displayName || auth.currentUser.displayName, 
            photoURL: photoURL || auth.currentUser.photoURL 
        });

        // We skip updateEmail here because Firebase usually requires re-authentication for sensitive actions
        // But we update the local context state so the UI reacts
        setCurrentUser({ ...auth.currentUser, displayName, photoURL });
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        currentUser,
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
