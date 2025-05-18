import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URI; // Backend API base URL

export type UserRole = 'admin' | 'user';

export interface User {
  _id: string; 
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          const userData: User = {
            _id: data._id, 
            name: data.name,
            email: data.email,
            role: data.role,
          };

          set({ 
            user: userData,
            token: data.token,
            isLoading: false
          });
          toast.success(`Welcome back, ${userData.name}!`);
        } catch (error) {
          set({ isLoading: false });
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during login';
          toast.error(errorMessage);
          throw error; 
        }
      },
      
      register: async (name, email, password, role) => { 
        // Similar optimization can be applied here if needed, but focusing on login for now
        const registerPromise = fetch(`${API_BASE_URL}/users`, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });
        set({ isLoading: true });
        try {
          const payload: any = { name, email, password };
          if (role) {
            payload.role = role; 
          }

          const response = await registerPromise;

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }

          const userData: User = {
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
          };

          set({ 
            user: userData,
            token: data.token,
            isLoading: false
          });
          toast.success('Registration successful! Please log in.');
        } catch (error) {
          set({ isLoading: false });
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during registration';
          toast.error(errorMessage);
          throw error; 
        }
      },
      
      logout: () => {
        set({ user: null, token: null });
        toast.info('You have been logged out');
      }
    }),
    {
      name: 'library-auth-storage', 
    }
  )
);
