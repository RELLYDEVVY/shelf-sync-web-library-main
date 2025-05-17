
import React, { useEffect, useState } from 'react';
import { useBookStore, BorrowedBook } from '@/store/bookStore';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Book, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const { borrowedBooks, fetchBorrowedBooks, isLoading } = useBookStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchBorrowedBooks();
  }, [fetchBorrowedBooks]);
  
  // Function to calculate days remaining until due date
  const getDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Function to get status color based on days remaining
  const getStatusColor = (daysRemaining: number): string => {
    if (daysRemaining < 0) return 'bg-red-500'; // Overdue
    if (daysRemaining <= 3) return 'bg-yellow-500'; // Due soon
    return 'bg-green-500'; // Good standing
  };
  
  // Function to get status text based on days remaining
  const getStatusText = (daysRemaining: number): string => {
    if (daysRemaining < 0) return 'Overdue';
    if (daysRemaining <= 3) return 'Due Soon';
    return 'Good Standing';
  };
  
  // Filter out returned books and ensure book data exists
  const activeBorrows = borrowedBooks.filter(borrow => 
    !borrow.returned && borrow.book
  );
  
  // Filter borrowed books based on search term
  const filteredBorrows = activeBorrows.filter(borrow => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      borrow.book?.title?.toLowerCase().includes(searchTermLower) ||
      borrow.book?.author?.toLowerCase().includes(searchTermLower) ||
      borrow.book?.category?.toLowerCase().includes(searchTermLower) ||
      false
    );
  });
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-library-primary mb-6">
        Welcome, {user?.name}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">My Books</CardTitle>
            <CardDescription>Currently borrowed books</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-library-primary">
              {activeBorrows.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Next Due</CardTitle>
            <CardDescription>Your nearest due date</CardDescription>
          </CardHeader>
          <CardContent>
            {activeBorrows.length > 0 ? (
              <div className="text-xl font-semibold text-library-primary">
                {new Date(activeBorrows.sort((a, b) => 
                  new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                )[0].dueDate).toLocaleDateString()}
              </div>
            ) : (
              <div className="text-gray-500">No books due</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Reading History</CardTitle>
            <CardDescription>Total books borrowed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-library-primary">
              {borrowedBooks.filter(borrow => borrow.returned).length + activeBorrows.length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold text-library-primary">
          Currently Borrowed Books
        </h2>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search your books..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-library-primary"></div>
        </div>
      ) : activeBorrows.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Book size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No Books Borrowed</h3>
              <p className="text-gray-500">You haven't borrowed any books yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredBorrows.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No Results Found</h3>
              <p className="text-gray-500">Try adjusting your search term.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBorrows.map((borrow) => {
            const daysRemaining = getDaysRemaining(borrow.dueDate);
            return (
              <Card key={borrow._id} className="book-card book-card-hover">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold line-clamp-2">{borrow.book?.title || 'Unknown Book'}</h3>
                    <Badge className={getStatusColor(daysRemaining)}>
                      {getStatusText(daysRemaining)}
                    </Badge>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{borrow.book?.author || 'Unknown Author'}</p>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Borrowed Date</p>
                      <p className="font-medium">{new Date(borrow.borrowDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium">{new Date(borrow.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <Calendar size={16} className="text-library-primary" />
                    {daysRemaining < 0 ? (
                      <span className="text-red-500 font-medium">
                        {Math.abs(daysRemaining)} days overdue
                      </span>
                    ) : (
                      <span className={`font-medium ${daysRemaining <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {daysRemaining} days remaining
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
