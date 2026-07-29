import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/lib/api";

interface User {
  id?: number;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      console.log("Login response:", response.data);

      // Handle different response structures
      // API returns: { message, user, auth_token, role }
      type ResponseData = {
        auth_token?: string;
        token?: string;
        access_token?: string;
        user?: User;
        data?: {
          auth_token?: string;
          token?: string;
          access_token?: string;
          user?: User;
        };
      };
      const responseData = (response.data?.data ??
        response.data) as ResponseData;
      const newToken =
        responseData?.auth_token ||
        responseData?.token ||
        responseData?.access_token ||
        responseData?.data?.auth_token ||
        responseData?.data?.token;
      const userData =
        responseData?.user || responseData?.data?.user || responseData;

      console.log("Extracted token:", newToken);
      console.log("Extracted user:", userData);

      if (!newToken) {
        console.error("No token found in response:", response.data);
        throw new Error(
          "No token received from server. Please check server response."
        );
      }

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData || { email });
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Better error message handling
      let errorMessage = "Login failed";

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === "ERR_NETWORK"
      ) {
        errorMessage =
          "Network Error: Cannot connect to server. Please check your internet connection and ensure the API server is running.";
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: unknown }).response
      ) {
        const err = error as {
          response: { data?: unknown; status?: number; statusText?: string };
        };
        const serverData = err.response.data;

        if (serverData && typeof serverData === "object") {
          const dataObj = serverData as Record<string, unknown>;
          const msg =
            (typeof dataObj.message === "string" && dataObj.message) ||
            (typeof dataObj.error === "string" && dataObj.error);
          if (msg) {
            errorMessage = msg;
          } else {
            errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
          }
        } else if (typeof serverData === "string") {
          errorMessage = serverData;
        } else {
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (
        typeof error === "object" &&
        error !== null &&
        "request" in error
      ) {
        errorMessage =
          "No response from server. Please check if the API server is running.";
      } else if (error instanceof Error) {
        errorMessage = error.message || "Login failed";
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
