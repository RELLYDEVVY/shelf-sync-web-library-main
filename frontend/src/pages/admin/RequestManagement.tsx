import React, { useEffect, useState } from 'react';
import { useRequestStore } from '@/store/requestStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Check, X, BookMarked, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const RequestManagement = () => {
  const { 
    allRequests, 
    fetchAllRequests, 
    approveRequest, 
    rejectRequest, 
    issueRequest, 
    markAsReturned,
    isLoading 
  } = useRequestStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  // Filter requests based on search term and status
  const filteredRequests = allRequests.filter(request => {
    // Status filter
    if (statusFilter && statusFilter !== '_ALL_' && request.status !== statusFilter) {
      return false;
    }
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.book?.title?.toLowerCase().includes(searchLower) ||
        request.book?.author?.toLowerCase().includes(searchLower) ||
        request.user?.name?.toLowerCase().includes(searchLower) ||
        request.user?.email?.toLowerCase().includes(searchLower) ||
        false
      );
    }
    
    return true;
  });

  // Handle request approval
  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest(requestId);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  // Handle request rejection
  const handleReject = async () => {
    if (!selectedRequestId) return;
    
    try {
      await rejectRequest(selectedRequestId, rejectionNotes);
      setRejectDialogOpen(false);
      setSelectedRequestId('');
      setRejectionNotes('');
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  // Open reject dialog
  const openRejectDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectionNotes('');
    setRejectDialogOpen(true);
  };

  // Handle book issuance
  const handleIssue = async (requestId: string) => {
    try {
      await issueRequest(requestId);
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  // Handle marking book as returned
  const handleReturn = async (requestId: string) => {
    try {
      await markAsReturned(requestId);
    } catch (error) {
      console.error('Error marking book as returned:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Approved</Badge>;
      case 'issued':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Issued</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'returned':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Returned</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-library-primary">Book Requests</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search requests..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <span>{statusFilter || 'All Statuses'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_ALL_">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-library-primary"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No Requests Found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'There are no book requests at the moment.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{request.book?.title || 'Unknown Book'}</div>
                        <div className="text-sm text-gray-500">{request.book?.author || 'Unknown Author'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{request.user?.name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">{request.user?.email || 'No email'}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{formatDate(request.requestDate)}</TableCell>
                    <TableCell>{formatDate(request.dueDate)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              onClick={() => handleApprove(request._id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              onClick={() => openRejectDialog(request._id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {request.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            onClick={() => handleIssue(request._id)}
                          >
                            <BookMarked className="h-4 w-4 mr-1" />
                            Issue
                          </Button>
                        )}
                        
                        {request.status === 'issued' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            onClick={() => handleReturn(request._id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Return
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Book Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. This will be visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestManagement;
