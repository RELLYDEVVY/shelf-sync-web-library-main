import { create } from 'zustand';
import { toast } from 'sonner';
import { useAuthStore } from './authStore';
import { Book } from './bookStore';

export interface BookRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  book: Book;
  status: 'pending' | 'approved' | 'issued' | 'rejected' | 'returned' | 'cancelled';
  requestDate: string;
  approvalDate?: string;
  issueDate?: string;
  dueDate?: string;
  returnDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RequestState {
  userRequests: BookRequest[];
  allRequests: BookRequest[];
  isLoading: boolean;
  
  // User actions
  fetchUserRequests: () => Promise<void>;
  createBookRequest: (bookId: string) => Promise<void>;
  cancelBookRequest: (requestId: string) => Promise<void>;
  
  // Admin actions
  fetchAllRequests: () => Promise<void>;
  approveRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string, notes?: string) => Promise<void>;
  issueRequest: (requestId: string) => Promise<void>;
  markAsReturned: (requestId: string) => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URI;

export const useRequestStore = create<RequestState>()((set, get) => ({
  userRequests: [],
  allRequests: [],
  isLoading: false,
  
  // User actions
  fetchUserRequests: async () => {
    set({ isLoading: true });
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/requests/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch your book requests');
      }
      
      const data = await response.json();
      set({ userRequests: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch your requests: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  createBookRequest: async (bookId: string) => {
    set({ isLoading: true });
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ bookId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request book');
      }
      
      const newRequest = await response.json();
      
      // Update the user requests list
      set(state => ({
        userRequests: [...state.userRequests, newRequest],
        isLoading: false
      }));
      
      toast.success('Book requested successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to request book: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error; // Re-throw to handle in component
    }
  },
  
  cancelBookRequest: async (requestId: string) => {
    set({ isLoading: true });
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel request');
      }
      
      const updatedRequest = await response.json();
      
      // Update the user requests list
      set(state => ({
        userRequests: state.userRequests.map(req => 
          req._id === requestId ? updatedRequest : req
        ),
        isLoading: false
      }));
      
      toast.success('Request cancelled successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to cancel request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  // Admin actions
  fetchAllRequests: async () => {
    set({ isLoading: true });
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch book requests');
      }
      
      const data = await response.json();
      set({ allRequests: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch requests: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  approveRequest: async (requestId: string) => {
    set({ isLoading: true });
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve request');
      }
      
      const updatedRequest = await response.json();
      
      // Update the all requests list
      set(state => ({
        allRequests: state.allRequests.map(req => 
          req._id === requestId ? updatedRequest : req
        ),
        isLoading: false
      }));
      
      toast.success('Request approved successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to approve request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  rejectRequest: async (requestId: string, notes?: string) => {
    set({ isLoading: true });
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject request');
      }
      
      const updatedRequest = await response.json();
      
      // Update the all requests list
      set(state => ({
        allRequests: state.allRequests.map(req => 
          req._id === requestId ? updatedRequest : req
        ),
        isLoading: false
      }));
      
      toast.success('Request rejected successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to reject request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  issueRequest: async (requestId: string) => {
    set({ isLoading: true });
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/issue`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to issue book');
      }
      
      const updatedRequest = await response.json();
      
      // Update the all requests list
      set(state => ({
        allRequests: state.allRequests.map(req => 
          req._id === requestId ? updatedRequest : req
        ),
        isLoading: false
      }));
      
      toast.success('Book issued successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to issue book: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  markAsReturned: async (requestId: string) => {
    set({ isLoading: true });
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark book as returned');
      }
      
      const updatedRequest = await response.json();
      
      // Update the all requests list
      set(state => ({
        allRequests: state.allRequests.map(req => 
          req._id === requestId ? updatedRequest : req
        ),
        isLoading: false
      }));
      
      toast.success('Book marked as returned successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to mark book as returned: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}));
