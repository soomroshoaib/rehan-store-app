import { createContext, useContext, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rs_user'));
    } catch {
      return null;
    }
  });

  const save = (u) => {
    localStorage.setItem('rs_token', u.token);
    localStorage.setItem('rs_user', JSON.stringify(u));
    setUser(u);
  };

  const login = async (email, password) => save(await api.post('/auth/login', { email, password }));
  const register = async (data) => save(await api.post('/auth/register', data));
  const logout = () => {
    localStorage.removeItem('rs_token');
    localStorage.removeItem('rs_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
