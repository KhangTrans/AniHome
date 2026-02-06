import React, { createContext, useState, useContext, useEffect } from 'react';
import { checkCredentials } from '../data/mockUsers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const foundUser = checkCredentials(email, password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return { success: true, role: foundUser.role };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const register = (email, password, name, role = 'adopter') => {
    // In a real app, we would validate availability. 
    // Here we just mock a successful registration and login.
    const newUser = {
      id: Date.now(),
      email,
      name,
      role,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
    };
    
    // We don't actually add to MOCK_USERS array persistently in this static demo,
    // but we simulate the session state.
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
