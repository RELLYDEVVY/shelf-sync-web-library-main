
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-library-secondary to-white px-4">
      <BookOpen size={80} className="text-library-primary mb-6" />
      <h1 className="text-6xl font-bold text-library-primary mb-4">404</h1>
      <p className="text-2xl text-gray-700 mb-8">Page Not Found</p>
      <p className="text-gray-600 max-w-md text-center mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button className="bg-library-primary hover:bg-blue-800">
          Return to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
