
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import UserDashboard from "@/pages/UserDashboard";
import AvailableBooks from "@/pages/AvailableBooks";
import BookList from "@/pages/admin/BookList";
import BookForm from "@/pages/admin/BookForm";
import BorrowingManagement from "@/pages/admin/BorrowingManagement";
import RequestManagement from "@/pages/admin/RequestManagement";
import UsersManagement from "@/pages/admin/UsersManagement";
import NotFound from "@/pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Redirect from root to admin or login */}
          <Route path="/" element={<Navigate to="/admin" />} />
          <Route element={<MainLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          {/* User Routes (Protected) */}
          <Route element={<MainLayout requireAuth={true} requiredRole="user" />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/books" element={<AvailableBooks />} />
          </Route>
          
          {/* Admin Routes (Protected) */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<BookList />} />
            <Route path="/admin/books" element={<BookList />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/books/new" element={<BookForm />} />
            <Route path="/admin/books/edit/:id" element={<BookForm />} />
            <Route path="/admin/borrowing" element={<BorrowingManagement />} />
            <Route path="/admin/requests" element={<RequestManagement />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
