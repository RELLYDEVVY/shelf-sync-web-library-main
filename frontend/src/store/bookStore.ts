import { create } from 'zustand';
import { toast } from 'sonner';
import { useAuthStore } from './authStore';

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowedBook {
  _id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returned: boolean;
  book: Book;
  createdAt?: string;
  updatedAt?: string;
}

interface BookState {
  books: Book[];
  borrowedBooks: BorrowedBook[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchBooks: () => Promise<void>;
  fetchBorrowedBooks: () => Promise<void>;
  addBook: (book: Omit<Book, '_id'>) => Promise<void>;
  updateBook: (id: string, bookData: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  borrowBook: (bookId: string, userId: string, dueDate: string) => Promise<void>;
  returnBook: (borrowId: string) => Promise<void>;
}

const API_BASE_URL = process.env.REACT_APP_BACKEND_URI || 'http://localhost:5000/api';

export const useBookStore = create<BookState>()((set, get) => ({
  books: [],
  borrowedBooks: [],
  isLoading: false,
  searchTerm: '',
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  fetchBooks: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch books');
      }
      
      const data = await response.json();
      set({ books: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch books: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  fetchBorrowedBooks: async () => {
    set({ isLoading: true });
    try {
      const { token, user } = useAuthStore.getState();
      console.log('Current user:', user); // Debug log
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Use different endpoints based on user role
      const endpoint = user?.role === 'admin' ? '/borrowing' : '/borrowing/mybooks';
      console.log('Using endpoint:', endpoint); // Debug log
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to fetch borrowed books');
      }
      
      const data = await response.json();
      console.log('Received borrowed books:', data); // Debug log
      set({ borrowedBooks: data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, borrowedBooks: [] }); // Reset borrowed books on error
      toast.error('Failed to fetch borrowed books: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  addBook: async (bookData) => {
    try {
      set({ isLoading: true });
      
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add book');
      }
      
      const newBook = await response.json();
      
      set(state => ({ 
        books: [...state.books, newBook],
        isLoading: false
      }));
      
      toast.success(`Book "${bookData.title}" has been added`);
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to add book: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  updateBook: async (id, bookData) => {
    try {
      set({ isLoading: true });
      
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update book');
      }
      
      const updatedBook = await response.json();
      
      set(state => ({
        books: state.books.map(book => 
          book._id === id ? updatedBook : book
        ),
        isLoading: false
      }));
      
      toast.success('Book has been updated');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to update book: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  deleteBook: async (id) => {
    try {
      set({ isLoading: true });
      
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete book');
      }
      
      set(state => ({
        books: state.books.filter(book => book._id !== id),
        isLoading: false
      }));
      
      toast.success('Book has been deleted');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to delete book: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  borrowBook: async (bookId, userId, dueDate) => {
    try {
      set({ isLoading: true });
      
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/borrowing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId,
          userId,
          dueDate
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to borrow book');
      }
      
      const newBorrowedBook = await response.json();
      
      // Refresh both books and borrowed books lists
      await Promise.all([
        get().fetchBooks(),
        get().fetchBorrowedBooks()
      ]);
      
      set({ isLoading: false });
      
      toast.success(`Book has been borrowed successfully`);
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to borrow book: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },
  
  returnBook: async (borrowId) => {
    try {
      set({ isLoading: true });
      
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/borrowing/${borrowId}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to return book');
      }
      
      // Refresh both books and borrowed books lists
      await Promise.all([
        get().fetchBooks(),
        get().fetchBorrowedBooks()
      ]);
      
      set({ isLoading: false });
      
      toast.success('Book has been returned successfully');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to return book: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}));
