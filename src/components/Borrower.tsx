import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { FaTrash } from 'react-icons/fa';
import AddBorrowerModal from './AddBorrowerModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth

interface Borrower {
  id: string;
  idNumber: string;
  fullName: string;
  courseYear: string;
  callNumber: string;
  bookTitle: string;
  author: string;
  copyright: string;
  dateIssued: string;
  dateReturned: string;
  status: string;
}

export default function BorrowerList() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State for authentication
  const [lastVisible, setLastVisible] = useState<any>(null); // Track the last document for pagination
  const [loadingMore, setLoadingMore] = useState(false); // State for loading more borrowers

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); // User is authenticated
      } else {
        setIsAuthenticated(false); // User is not authenticated
        toast.error('You must be logged in to access the borrower list.');
        // Optionally, redirect the user to the login page
        window.location.href = '/login'; // Adjust the redirect URL as needed
      }
    });

    // Clean up the authentication listener
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return; // Skip fetching borrowers if not authenticated

    const q = query(
      collection(db, 'borrowers'),
      orderBy('dateIssued', 'desc'),
      limit(10) // Limit the number of borrowers loaded at once
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const borrowerData: Borrower[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Borrower[];
        setBorrowers(borrowerData);
        setLoading(false);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      },
      (error) => {
        console.error('Error fetching data: ', error);
        toast.error('Failed to load borrower data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this borrower?');
    if (!isConfirmed) return;

    try {
      await deleteDoc(doc(db, 'borrowers', id));
      toast.success('Borrower deleted successfully');
    } catch (error) {
      toast.error('Failed to delete borrower');
    }
  };

  const handleAddBorrower = () => {
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString('en-US');
  };

  const handleStatusChange = async (borrowerId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'borrowers', borrowerId), {
        status: newStatus,
        dateReturned: newStatus === 'Returned' ? new Date().toISOString() : '',
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const loadMore = () => {
    if (loadingMore || !lastVisible) return; // Prevent multiple loads

    setLoadingMore(true);
    const q = query(
      collection(db, 'borrowers'),
      orderBy('dateIssued', 'desc'),
      startAfter(lastVisible), // Start from the last document
      limit(10) // Limit the number of borrowers loaded
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const borrowerData: Borrower[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Borrower[];
        setBorrowers((prevState) => [...prevState, ...borrowerData]); // Append the new data
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setLoadingMore(false);
      },
      (error) => {
        console.error('Error fetching data: ', error);
        toast.error('Failed to load more borrower data');
        setLoadingMore(false);
      }
    );

    return () => unsubscribe();
  };

  if (!isAuthenticated) {
    return null; // Optionally, show a loading spinner or an alert while checking authentication
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#F5F5F7] min-h-screen">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium text-gray-800">Borrower List</h1>
          <button
            onClick={handleAddBorrower}
            className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
            title="Add Borrower"
          >
            Add Borrower
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search Borrowers..."
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Loading borrowers...</p>
            </div>
          ) : borrowers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No borrowers found</p>
              <p className="text-gray-400 text-xs mt-1">Use the search bar or click the button to add a borrower</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Returned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {borrowers.map((borrower) => (
                    <tr key={borrower.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.idNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.courseYear}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.bookTitle}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(borrower.dateIssued)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.dateReturned ? formatDate(borrower.dateReturned) : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <select
                          value={borrower.status}
                          onChange={(e) => handleStatusChange(borrower.id, e.target.value)}
                          className="bg-gray-100 text-sm py-2 px-4 rounded-md"
                        >
                          <option value="Issued">Issued</option>
                          <option value="Returned">Returned</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <button
                          onClick={() => handleDelete(borrower.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Borrower"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loadingMore ? (
                <div className="text-center py-4">Loading more borrowers...</div>
              ) : (
                <div className="text-center py-4">
                  <button onClick={loadMore} className="text-blue-600">Load More</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
      <AddBorrowerModal isOpen={isAddModalOpen} onClose={handleModalClose} />
    </div>
  );
}
