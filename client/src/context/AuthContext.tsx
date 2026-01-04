import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type User } from "../types"; // 1. interface for user type

// 2. interface for AuthContext - what you need providing for other page
interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// 3. create context
const AuthContext = createContext<AuthContextType | null>(null);

// 4. provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // 4.1 use useState to store user
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setAuthLoading(false);
  }, []);

  // 4.2 write login function
  const login = (userData: User): void => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };
  // 4.3 write logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
