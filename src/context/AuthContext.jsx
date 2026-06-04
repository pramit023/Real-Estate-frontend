/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import axios from "axios";
import API_URL from "../../config";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null,
  );

  const navigate = useNavigate();

  const logout = useCallback(async () => {
    const activeToken = token || localStorage.getItem("token") || sessionStorage.getItem("token");

    if (activeToken) {
      try {
        await axios.post(`${API_URL}/api/auth/logout`, null, {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });
      } catch (err) {
        console.error("Logout request failed:", err.response?.data || err.message);
      }
    }

    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  }, [navigate, token]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data?.message?.includes("blocked")
        ) {
          logout();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data;

      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(user));

      return {
        success: true,
      };
    } catch (err) {
      console.log("Login Error", err.response?.data)
      console.log("Status:", err.response?.status);
  console.log("Data:", err.response?.data);
  console.log("Message:", err.response?.data?.message);
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  // REGISTER
  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);

      return {
        success: true,
        message: res.data.message,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  // REFRESH USER
  const refreshUser = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const updatedUser = res.data.user;

        setUser(updatedUser);

        const storage = localStorage.getItem("token")
          ? localStorage
          : sessionStorage;

        storage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const fetchProfile = async () => {
    if (!token) return null;

    try {
      const res = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);

        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(updatedUser));

        return updatedUser;
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err.response?.data || err.message);
    }

    return null;
  };

  const updateProfile = async (profileData) => {
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    try {
      const formData = new FormData();
      if (profileData.name !== undefined) formData.append("name", profileData.name);
      if (profileData.phone !== undefined) formData.append("phone", profileData.phone);
      if (profileData.address !== undefined) formData.append("address", profileData.address);
      if (profileData.removeProfilePic !== undefined)
        formData.append("removeProfilePic", profileData.removeProfilePic ? "true" : "false");
      if (profileData.profilePic instanceof File) formData.append("profilePic", profileData.profilePic);

      const res = await axios.put(`${API_URL}/api/users/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);

        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(updatedUser));

        return { success: true, message: res.data.message || "Profile updated successfully", user: updatedUser };
      }

      return { success: false, message: res.data.message || "Profile update failed" };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Profile update failed" };
    }
  };

  const deleteAccount = async () => {
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    try {
      const res = await axios.delete(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        logout();
        return { success: true, message: res.data.message || "Account deleted" };
      }

      return { success: false, message: res.data.message || "Unable to delete account" };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Unable to delete account" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        login,
        register,
        logout,
        refreshUser,
        fetchProfile,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
