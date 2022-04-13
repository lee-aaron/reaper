import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";

const AuthContext = React.createContext(
  {} as {
    user: any;
    authenticate: (newToken: string) => Promise<void>;
    logout: ({ redirectLocation }: { redirectLocation: string }) => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    token: string;
  }
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const logout = ({ redirectLocation }: { redirectLocation?: string }) => {
    Cookies.remove("token");
    setIsLoading(false);
    console.log("Redirecting");
    router.push(redirectLocation || "/login");
  };

  const authenticate = async (token: string) => {
    setIsLoading(true);
    try {
      Cookies.set("token", token);
    } catch (error) {
      console.log({ error });
      Cookies.remove("token");
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticate,
        logout,
        isLoading,
        isAuthenticated: !!user,
        token: Cookies.get("token") || "",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
