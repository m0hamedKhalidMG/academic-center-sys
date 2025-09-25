import { create } from 'zustand';

const useStore = create((set) => ({
  token: null,
  role: null,
  setAuth: (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    set({ token, role });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    set({ token: null, role: null });
  },
}));

export default useStore;
