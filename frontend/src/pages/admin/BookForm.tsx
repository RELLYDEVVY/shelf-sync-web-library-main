
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookStore, Book } from '@/store/bookStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const BookForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, addBook, updateBook, fetchBooks } = useBookStore();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1,
    imageUrl: ''
  });

  const [errors, setErrors] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: ''
  });
  
  const isEditing = !!id;
  
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);
  
  useEffect(() => {
    if (isEditing && books.length > 0) {
      const bookToEdit = books.find(book => book._id === id);
      if (bookToEdit) {
        setFormData({
          title: bookToEdit.title,
          author: bookToEdit.author,
          isbn: bookToEdit.isbn,
          category: bookToEdit.category,
          quantity: bookToEdit.quantity,
          imageUrl: bookToEdit.imageUrl || ''
        });
      } else {
        toast.error('Book not found');
        navigate('/admin/books');
      }
    }
  }, [id, books, isEditing, navigate]);

  const validate = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      author: '',
      isbn: '',
      category: '',
      quantity: ''
    };

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
      isValid = false;
    }

    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required';
      isValid = false;
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
      isValid = false;
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      if (isEditing && id) {
        await updateBook(id, formData);
        toast.success('Book updated successfully');
      } else {
        await addBook(formData);
        toast.success('Book added successfully');
      }
      navigate('/admin/books');
    } catch (error) {
      toast.error('Error saving book');
      console.error('Error saving book:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/books')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-library-primary">
          {isEditing ? 'Edit Book' : 'Add New Book'}
        </h1>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter book title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter author name"
              className={errors.author ? "border-red-500" : ""}
            />
            {errors.author && <p className="text-red-500 text-sm">{errors.author}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Enter ISBN (e.g., 978-3-16-148410-0)"
                className={errors.isbn ? "border-red-500" : ""}
              />
              {errors.isbn && <p className="text-red-500 text-sm">{errors.isbn}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category (e.g., Fiction, Science)"
                className={errors.category ? "border-red-500" : ""}
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Cover Image URL (optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/book-cover.jpg"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/admin/books')}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-library-primary hover:bg-blue-800">
              {isEditing ? 'Update Book' : 'Add Book'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BookForm;
