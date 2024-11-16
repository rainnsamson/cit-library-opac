import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaTrash } from 'react-icons/fa';
import AddBorrowerModal from './AddBorrowerModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  useEffect(() => {
    const q = query(collection(db, 'borrowers'), orderBy('dateIssued', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const borrowerData: Borrower[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Borrower[];
        setBorrowers(borrowerData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching data: ', error);
        toast.error('Failed to load borrower data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

  const filteredBorrowers = borrowers.filter((borrower) => {
    return (
      borrower.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.callNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrower.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
          ) : filteredBorrowers.length === 0 ? (
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
                  {filteredBorrowers.map((borrower) => (
                    <tr key={borrower.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.idNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.courseYear}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{borrower.bookTitle}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(borrower.dateIssued)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {borrower.dateReturned ? formatDate(borrower.dateReturned) : 'Not Returned'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <select
                          value={borrower.status}
                          onChange={(e) => handleStatusChange(borrower.id, e.target.value)}
                          className="bg-white border rounded-md p-2"
                        >
                          <option value="Not Returned" className="text-red-500">
                            Not Returned
                          </option>
                          <option value="Returned" className="text-green-500">
                            Returned
                          </option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <button
                          onClick={() => handleDelete(borrower.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
      <AddBorrowerModal isOpen={isAddModalOpen} onClose={handleModalClose} />
    </div>
  );
}
