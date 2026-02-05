import { createContext, useContext, useState } from 'react';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

type AuthState = {
  role: Role | null;
  setRole: (r: Role | null) => void;
};

const AuthContext = createContext<AuthState>({
  role: null,
  setRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
