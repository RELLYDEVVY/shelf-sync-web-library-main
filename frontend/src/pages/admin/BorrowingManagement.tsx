import React, { useEffect, useState, useMemo } from 'react';
import { useBookStore } from '@/store/bookStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, LibraryBig, Check } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URI || 'http://localhost:5000/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const BorrowingManagement = () => {
  const { books, borrowedBooks, fetchBooks, fetchBorrowedBooks, borrowBook, returnBook } = useBookStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form state for new borrow
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchBooks(), fetchBorrowedBooks(), fetchUsers()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchBooks, fetchBorrowedBooks]);
  
  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
      const token = useAuthStore.getState().token;
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };
  
  // Filter borrowed books based on search term
  const filteredBorrows = borrowedBooks.filter(borrow => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    const bookMatch = borrow.book && (
      borrow.book.title?.toLowerCase().includes(searchTermLower) ||
      borrow.book.author?.toLowerCase().includes(searchTermLower)
    );
    
    const user = users.find(user => user._id === borrow.userId);
    const userMatch = user && (
      user.name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    );
    
    return bookMatch || userMatch || false;
  });

  // Get only available books (quantity > 0)
  const availableBooks = books.filter(book => book.quantity > 0);
  
  const handleReturn = async (borrowId: string) => {
    await returnBook(borrowId);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBookId || !selectedUserId || !dueDate) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await borrowBook(selectedBookId, selectedUserId, dueDate);
      setIsAddDialogOpen(false);
      
      // Reset form
      setSelectedBookId('');
      setSelectedUserId('');
      setDueDate('');
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };
  
  const getUserName = (userId: string) => {
    const user = users.find(user => user._id === userId);
    return user ? user.name : 'Unknown User';
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate days remaining or overdue
  const getDaysStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-500">{Math.abs(diffDays)} days overdue</span>;
    }
    
    return <span className="text-green-600">{diffDays} days remaining</span>;
  };
  
  // Get today's date in YYYY-MM-DD format for the min attribute of the date input
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-library-primary">Borrowing Management</h1>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-library-primary hover:bg-blue-800">
              <LibraryBig className="mr-2 h-4 w-4" />
              Issue Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue a Book</DialogTitle>
              <DialogDescription>
                Assign a book to a user. Make sure to set an appropriate due date.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="book">Book</Label>
                  <Select
                    value={selectedBookId}
                    onValueChange={setSelectedBookId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a book" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBooks.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No books available
                        </SelectItem>
                      ) : (
                        availableBooks.map(book => (
                          <SelectItem key={book._id} value={book._id}>
                            {book.title} ({book.quantity} available)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user">User</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    min={today}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-library-primary hover:bg-blue-800">
                  Issue Book
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search borrowing records..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-library-primary"></div>
            </div>
          ) : borrowedBooks.length === 0 ? (
            <div className="text-center p-10">
              <h3 className="text-lg font-medium text-gray-600 mb-2">No borrowing records found</h3>
              <p className="text-sm text-gray-500">Issue books to users to see records here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Borrow Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBorrows.map((borrow) => (
                  <TableRow key={borrow._id} className={borrow.returned ? "bg-gray-50" : ""}>
                    <TableCell className="font-medium">{borrow.book?.title || 'Unknown Book'}</TableCell>
                    <TableCell>{getUserName(borrow.userId)}</TableCell>
                    <TableCell>{formatDate(borrow.borrowDate)}</TableCell>
                    <TableCell>{formatDate(borrow.dueDate)}</TableCell>
                    <TableCell>
                      {borrow.returned ? (
                        <span className="text-green-600">Returned</span>
                      ) : (
                        getDaysStatus(borrow.dueDate)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!borrow.returned && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleReturn(borrow._id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowingManagement;
