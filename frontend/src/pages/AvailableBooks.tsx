import React, { useEffect, useState } from 'react';
import { useBookStore } from '@/store/bookStore';
import { useRequestStore } from '../store/requestStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Filter, LibraryBig } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';

const AvailableBooks = () => {
  const { user } = useAuthStore();
  const { books, fetchAvailableBooks, isLoading } = useBookStore();
  const { createBookRequest, userRequests, fetchUserRequests } = useRequestStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch books with search parameters
    fetchAvailableBooks(searchTerm, selectedCategory);
    
    // Also fetch user's existing requests to prevent duplicate requests
    fetchUserRequests();
  }, [fetchAvailableBooks, fetchUserRequests, searchTerm, selectedCategory]);

  // Extract unique categories from books
  useEffect(() => {
    if (books.length > 0) {
      const uniqueCategories = Array.from(
        new Set(books.map((book) => book.category))
      ).filter(Boolean) as string[];
      
      setCategories(uniqueCategories);
    }
  }, [books]);

  // Handle search input changes with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "_ALL_" ? "" : value);
  };

  // Handle book request
  const handleRequestBook = async (bookId: string) => {
    try {
      // Check if user already has a pending or approved request for this book
      const existingRequest = userRequests.find(
        req => req.book._id === bookId && ['pending', 'approved', 'issued'].includes(req.status)
      );

      if (existingRequest) {
        toast.error(`You already have an active request for this book (Status: ${existingRequest.status})`);
        return;
      }

      await createBookRequest(bookId);
      toast.success('Book request submitted successfully!');
    } catch (error) {
      console.error('Error requesting book:', error);
      toast.error('Failed to request book');
    }
  };

  // Check if a book is already requested by the user
  const isBookRequested = (bookId: string) => {
    return userRequests.some(
      req => req.book._id === bookId && ['pending', 'approved', 'issued'].includes(req.status)
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-library-primary">Available Books</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>{selectedCategory || 'All Categories'}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_ALL_">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : books.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No Books Found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory
                  ? 'Try adjusting your search or filter criteria.'
                  : 'There are no books available in the library at the moment.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book._id} className="overflow-hidden book-card">
              <CardContent className="p-0">
                <div className="aspect-[3/2] relative bg-gray-100 flex items-center justify-center">
                  <LibraryBig size={64} className="text-gray-400" />
                  <Badge className="absolute top-2 right-2 bg-library-primary">
                    {book.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold line-clamp-1">{book.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">{book.author}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant={book.quantity > 0 ? "outline" : "destructive"}
                           className={book.quantity > 0 ? "border-green-500 text-green-700 bg-green-50" : ""}>
                      {book.quantity > 0 
                        ? `${book.quantity} Available` 
                        : 'Not Available'}
                    </Badge>
                    
                    <Button
                      onClick={() => handleRequestBook(book._id)}
                      disabled={!(book.quantity > 0) || isBookRequested(book._id)}
                      variant={isBookRequested(book._id) ? "outline" : "default"}
                      className="bg-library-primary hover:bg-blue-800"
                    >
                      {isBookRequested(book._id) ? 'Requested' : 'Request Book'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableBooks;
