import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Book } from '../types/book';
import AddBookModal from './AddBookModal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EditBookModal from './EditBookModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(20);
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
    setCurrentPage(1);
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.callNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
          Books Collection
        </h2>
        <button onClick={handleAddBook} className="btn-primary flex items-center">
          <span className="mr-2 text-lg">+</span>
          Add Book
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by title, author, call number, or location"
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Call Number</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Copyright</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Availability</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/50 divide-y divide-gray-200">
            {currentBooks.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.callNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{book.author}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 break-words">{book.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{book.copyright}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{book.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{book.availability}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${book.availability > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {book.availability > 0 ? 'Available' : 'Not Available'}
                  </span>
                </td>
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

      {/* Pagination controls */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: Math.ceil(filteredBooks.length / booksPerPage) }, (_, i) => i + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => paginate(pageNumber)}
            className={`px-3 py-1 border rounded ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border-blue-500'}`}
          >
            {pageNumber}
          </button>
        ))}
      </div>

      <AddBookModal isOpen={isAddModalOpen} onClose={handleModalClose} />
      <EditBookModal isOpen={isEditModalOpen} onClose={handleModalClose} bookToEdit={bookToEdit} />
      <ToastContainer />
    </div>
  );
}
