import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type User } from "../types"; // 1. interface for user type
import * as auth from "../api/auth";

// 2. interface for AuthContext - what you need providing for other page
interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 3. create context
const AuthContext = createContext<AuthContextType | null>(null);

// 4. provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // 4.1 use useState to store user
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { user } = await auth.checkAuth();
        setUser(user);
      } catch {
        // not login or token expire
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    check();
  }, []);

  // 4.2 write login function
  const login = async (email: string, password: string): Promise<void> => {
    const { user } = await auth.login(email, password);
    if (user) {
      setUser(user);
    } else {
      throw new Error("login failed");
    }
  };
  // 4.3 write logout function
  const logout = async (): Promise<void> => {
    try {
      await auth.logout();
      setUser(null);
    } catch (error) {
      throw new Error(`something went wrong with logout: ${error}`);
    }
  };

  // 4.4 return Provider, pass value
  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 5. useAuth hook
export function useAuth() {
  // use useContext to get context
  const authProvider = useContext(AuthContext);
  // check if context exists
  if (!authProvider) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  // return context
  return authProvider;
}
