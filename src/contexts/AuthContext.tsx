
import React, { createContext, useContext, useState, ReactNode } from "react";
import { users } from "@/lib/mock-data";

export type UserRole = "dj" | "promoter" | "venue" | "fan";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  isCreatorRole: () => boolean;
  isSubPromoter: () => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default user (for development purposes)
const defaultUser = users.find(user => user.id === "1");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(defaultUser as AuthUser || null);

  const isCreatorRole = () => {
    if (!currentUser) return false;
    return ["dj", "promoter", "venue"].includes(currentUser.role);
  };
  
  const isSubPromoter = () => {
    if (!currentUser) return false;
    return currentUser.role === "fan";
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isCreatorRole, isSubPromoter, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
