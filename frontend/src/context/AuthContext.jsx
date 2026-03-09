import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const userData = await authService.login(username, password);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const register = async (username, email, password) => {
        return authService.register(username, email, password);
    };

    const setupProfile = async (data) => {
        const response = await authService.setupProfile(data);
        const updatedUser = { ...user, profileSetup: true, monthlySalary: data.monthlySalary };
        localStorage.setItem('user', JSON.stringify(updatedUser)); // update LocalStorage directly
        setUser(updatedUser);
        return response;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, setupProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
