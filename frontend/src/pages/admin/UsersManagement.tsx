import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { toast as sonnerToast } from 'sonner';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URI || 'http://localhost:5000/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isActive?: boolean;
}

const UsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      sonnerToast.error('Failed to fetch users: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));
      
      const user = users.find(u => u._id === userId);
      toast({
        title: `User ${currentStatus ? 'Deactivated' : 'Activated'}`,
        description: `${user?.name} has been ${currentStatus ? 'deactivated' : 'activated'} successfully.`
      });
    } catch (error) {
      sonnerToast.error('Failed to update user status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-library-primary">User Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-library-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-600 mb-2">No users found</h3>
              <p className="text-sm text-gray-500">There are no users in the system yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive !== false)}
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          user.isActive !== false
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {user.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
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

export default UsersManagement;
