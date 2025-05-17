
import React, { useEffect, useState } from 'react';
import { useBookStore, Book } from '@/store/bookStore';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusCircle, Search, MoreHorizontal, Edit, Trash } from 'lucide-react';

const BookList = () => {
  const { books, fetchBooks, deleteBook, isLoading } = useBookStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');
  
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  
  // Filter books based on search term and availability
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAvailability = 
      availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && book.quantity > 0);
    
    return matchesSearch && matchesAvailability;
  });
  
  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
  };
  
  const handleDeleteConfirm = async () => {
    if (bookToDelete) {
      await deleteBook(bookToDelete._id);
      setBookToDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setBookToDelete(null);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-library-primary">Book Management</h1>
        <Link to="/admin/books/new">
          <Button className="bg-library-primary hover:bg-blue-800 w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Book
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search books..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="p-2 border rounded-md"
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available')}
        >
          <option value="all">All Books</option>
          <option value="available">Available Books</option>
        </select>
      </div>
      
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-library-primary"></div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center p-10">
              <h3 className="text-lg font-medium text-gray-600 mb-2">No books found</h3>
              <p className="text-sm text-gray-500 mb-4">Start by adding your first book to the library.</p>
              <Link to="/admin/books/new">
                <Button className="bg-library-primary hover:bg-blue-800">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Book
                </Button>
              </Link>
            </div>
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Author</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">ISBN</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book._id}>
                      <TableCell className="font-medium">
                        <div>
                          {book.title}
                          <div className="text-xs text-gray-500 md:hidden">
                            {book.author} • {book.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{book.author}</TableCell>
                      <TableCell className="hidden md:table-cell">{book.category}</TableCell>
                      <TableCell className="hidden md:table-cell">{book.isbn}</TableCell>
                      <TableCell className="text-center">
                        <span className={book.quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {book.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link to={`/admin/books/edit/${book._id}`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(book)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!bookToDelete} onOpenChange={() => setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{bookToDelete?.title}" from the library system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookList;
