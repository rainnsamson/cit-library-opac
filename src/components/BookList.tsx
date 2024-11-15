import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Book } from '../types/book';
import AddBookModal from './AddBookModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EditBookModal from './EditBookModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'books-collection'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookData: Book[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        bookData.push({
          id: doc.id,
          title: data.title,
          author: data.author,
          callNumber: data.callNumber,
          copyright: data.copyright,
          location: data.location,
          availability: data.availability,
          createdAt: data.createdAt,
        });
      });
      setBooks(bookData);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this book?');
    if (!isConfirmed) return;

    try {
      await deleteDoc(doc(db, 'books-collection', id));
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleEdit = (book: Book) => {
    setBookToEdit(book);
    setIsEditModalOpen(true);
  };

  const handleAddBook = () => {
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setBookToEdit(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.callNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#F5F5F7] min-h-screen">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium text-gray-800">Books Collection</h1>
          <button
            onClick={handleAddBook}
            className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
            title="Add Book"
          >
            <PlusCircleIcon className="h-8 w-8" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by title, author, call number, or location"
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="mt-4">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No books found</p>
              <p className="text-gray-400 text-xs mt-1">Use the search bar or click the plus icon to add a book</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copyright</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-600">{book.callNumber}</td>
                      <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-600">{book.author}</td>
                      <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-600">{book.title}</td>
                      <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-600">{book.copyright}</td>
                      <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-600">{book.location}</td>
                      <td className="px-6 py-4 whitespace-normal break-words text-sm text-gray-600">{book.availability}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(book)} className="text-indigo-600 hover:text-indigo-900 mr-2">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-900">
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

      <AddBookModal isOpen={isAddModalOpen} onClose={handleModalClose} />
      <EditBookModal isOpen={isEditModalOpen} onClose={handleModalClose} bookToEdit={bookToEdit} />
      <ToastContainer />
    </div>
  );
}
