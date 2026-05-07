import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  role: 'admin' | 'officer' | 'viewer';
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Persistence simulation
  useEffect(() => {
    const saved = localStorage.getItem('justiceflow_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email: string) => {
    // Simulated auth logic
    const mockUser: User = {
      email,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: 'admin',
      department: 'Compliance Unit'
    };
    setUser(mockUser);
    localStorage.setItem('justiceflow_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('justiceflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
