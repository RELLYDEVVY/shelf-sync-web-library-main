
import React, { useEffect } from 'react';
import { useBookStore } from '@/store/bookStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Users, BookOpen, Library } from 'lucide-react';

const AdminDashboard = () => {
  const { books, borrowedBooks, fetchBooks, fetchBorrowedBooks, isLoading } = useBookStore();
  
  useEffect(() => {
    fetchBooks();
    fetchBorrowedBooks();
  }, [fetchBooks, fetchBorrowedBooks]);

  // Calculate statistics
  const totalBooks = books.reduce((sum, book) => sum + book.quantity, 0);
  const borrowedCount = borrowedBooks.filter(item => !item.returned).length;
  const availableBooks = totalBooks - borrowedCount;
  const activeUsers = [...new Set(borrowedBooks.filter(item => !item.returned).map(item => item.userId))].length;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-library-primary">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Books
            </CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
            <p className="text-xs text-muted-foreground">
              {books.length} unique titles
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Books
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableBooks}</div>
            <p className="text-xs text-muted-foreground">
              {borrowedCount} currently borrowed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Borrowers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Users with borrowed books
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{borrowedBooks.length}</div>
            <p className="text-xs text-muted-foreground">
              Books borrowed to date
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Book Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-library-primary"></div>
              </div>
            ) : borrowedBooks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {borrowedBooks.slice(0, 5).map((borrow) => (
                  <div key={borrow.id} className="flex items-center">
                    <div className="mr-4 rounded-full bg-blue-100 p-2">
                      <Book className="h-4 w-4 text-library-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {borrow.book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {borrow.returned ? 'Returned' : 'Borrowed'} on {new Date(borrow.borrowDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-auto text-xs">
                      {borrow.returned ? (
                        <span className="text-green-600 font-medium">Returned</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Popular Book Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-library-primary"></div>
              </div>
            ) : books.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No books in the system</p>
            ) : (
              <div className="space-y-4">
                {Array.from(new Set(books.map(book => book.category)))
                  .slice(0, 5)
                  .map((category, index) => {
                    const count = books.filter(book => book.category === category).length;
                    const percentage = Math.round((count / books.length) * 100);
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{category}</div>
                          <div className="text-sm text-muted-foreground">{percentage}%</div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-library-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
