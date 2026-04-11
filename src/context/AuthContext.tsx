"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axiosSecure from "@/components/hook/axiosSecure";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("access-token");
    const storedUser = localStorage.getItem("auth-user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem("access-token");
        localStorage.removeItem("auth-user");
      }
    }

    setIsLoading(false);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const response = await axiosSecure.post("/auth/login", {
      email,
      password,
    });

    if (response.data?.success) {
      const { token: jwtToken, user: userData } = response.data.data;

      // Persist to localStorage
      localStorage.setItem("access-token", jwtToken);
      localStorage.setItem("auth-user", JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
    } else {
      throw new Error(response.data?.message || "Login failed");
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = () => {
    localStorage.removeItem("access-token");
    localStorage.removeItem("auth-user");
    setToken(null);
    setUser(null);

    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
