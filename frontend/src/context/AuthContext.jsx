// src/context/AuthContext.js
import React, { createContext, useContext, useState } from "react";

// 1️⃣ Create the context
const AuthContext = createContext(null);

// 2️⃣ Create provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // will store { name, email, token, etc. }

  // Save user details after login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // optional persistence
  };

  // Clear user details on logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Load user from localStorage on first render
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3️⃣ Custom hook to use context easily
export const useAuth = () => useContext(AuthContext);
