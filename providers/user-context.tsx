"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSession } from "@/lib/auth/auth-client";

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

interface UserContextType {
  user: User | null;
  userId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userId: null,
  loading: true,
  isAuthenticated: false,
  error: null,
  refreshUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error, refetch } = useSession();

  const value = useMemo(() => {
    const user = session?.user as User | null;
    return {
      user,
      userId: user?.id ?? null,
      loading: isPending,
      isAuthenticated: !!user,
      error: error ? "Failed to load session" : null,
      refreshUser: refetch,
    };
  }, [session, isPending, error, refetch]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
