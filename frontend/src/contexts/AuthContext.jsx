import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data && response.data.data) {
          setUser(response.data.data);
        }
      } catch (err) {
        // This is normal for unauthenticated users - don't show as error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting registration...");
      const response = await api.post("/auth/register", userData);
      console.log("Registration response:", response.data);
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);

      // Better error handling for validation errors
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors
          .map((e) => e.msg)
          .join(", ");
        setError(errorMessages);
      } else {
        setError(err.response?.data?.error || "Failed to register");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to logout");
      // Still clear user on the frontend even if logout API fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
