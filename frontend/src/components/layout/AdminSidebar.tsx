
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  PlusCircle,
  Library,
  Menu,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export const AdminSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const menuItems = [
    {
      title: 'Books',
      icon: BookOpen,
      path: '/admin/books'
    },
    {
      title: 'Users',
      icon: Users,
      path: '/admin/users'
    },
    {
      title: 'Add Book',
      icon: PlusCircle,
      path: '/admin/books/new'
    },
    {
      title: 'Borrowing',
      icon: Library,
      path: '/admin/borrowing'
    },
    {
      title: 'Book Requests',
      icon: FileText,
      path: '/admin/requests'
    }
  ];

  const SidebarContent = () => (
    <div className="h-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-library-primary">Admin Panel</h2>
      </div>
      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-library-primary text-white"
                    : "text-gray-700 hover:bg-library-secondary hover:text-library-primary"
                )}
              >
                <item.icon size={20} />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
  
  // Mobile version using Sheet
  if (isMobile) {
    return (
      <div className="block md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-white">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  // Desktop version
  return (
    <aside className="bg-white border-r border-gray-200 w-64 min-h-screen hidden md:block">
      <SidebarContent />
    </aside>
  );
};
