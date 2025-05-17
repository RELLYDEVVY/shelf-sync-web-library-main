
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const Index = () => {
  const { user } = useAuthStore();
  
  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    return user.role === 'admin' 
      ? <Navigate to="/admin" /> 
      : <Navigate to="/dashboard" />;
  }
  
  // If not logged in, redirect to login
  return <Navigate to="/login" />;
};

export default Index;
