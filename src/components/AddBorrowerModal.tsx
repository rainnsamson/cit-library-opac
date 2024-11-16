import { useState } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { FaSearch } from 'react-icons/fa';  // Import search icon

interface AddBorrowerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBorrowerModal({ isOpen, onClose }: AddBorrowerModalProps) {
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [courseYear, setCourseYear] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [copyright, setCopyright] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [dateReturned, setDateReturned] = useState('');

  if (!isOpen) return null;

  // Handle fetch book details based on input type (callNumber or bookTitle)
  const handleFetchBookDetails = async (type: 'callNumber' | 'bookTitle') => {
    let querySnapshot;
    try {
      if (type === 'callNumber') {
        const bookQuery = query(
          collection(db, 'books-collection'),
          where('callNumber', '==', callNumber.trim())
        );
        querySnapshot = await getDocs(bookQuery);
      } else {
        const bookQuery = query(
          collection(db, 'books-collection'),
          where('title', '==', bookTitle.trim())
        );
        querySnapshot = await getDocs(bookQuery);
      }

      if (!querySnapshot.empty) {
        const bookData = querySnapshot.docs[0].data();
        if (type === 'callNumber') {
          setBookTitle(bookData.title);
          setAuthor(bookData.author);
          setCopyright(bookData.copyright);
        } else {
          setCallNumber(bookData.callNumber);
          setAuthor(bookData.author);
          setCopyright(bookData.copyright);
        }
      } else {
        toast.error('No book found with this ' + (type === 'callNumber' ? 'call number' : 'book title'));
        if (type === 'callNumber') {
          // Clear only book-related fields when callNumber is searched and no book is found
          setBookTitle('');
          setAuthor('');
          setCopyright('');
        } else {
          // Clear callNumber-related fields when bookTitle is searched and no book is found
          setCallNumber('');
          setAuthor('');
          setCopyright('');
        }
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast.error('Failed to fetch book details');
    }
  };

  // Handle manual input for book fields (for example, callNumber or bookTitle)
  const handleManualInput = (type: 'callNumber' | 'bookTitle', value: string) => {
    if (type === 'callNumber') {
      setCallNumber(value);
      setBookTitle(''); // Clear bookTitle if entering a new callNumber
      setAuthor('');
      setCopyright('');
    } else {
      setBookTitle(value);
      setCallNumber(''); // Clear callNumber if entering a new bookTitle
      setAuthor('');
      setCopyright('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idNumber || !fullName || !courseYear || !callNumber || !bookTitle || !author || !copyright || !dateIssued || !dateReturned) {
      toast.error('Please fill out all fields');
      return;
    }

    try {
      // Removing the 'book' object and adding book fields as separate fields
      await addDoc(collection(db, 'borrowers'), {
        idNumber: idNumber.trim(),
        fullName: fullName.trim(),
        courseYear: courseYear.trim(),
        callNumber: callNumber.trim(),  // Keeping callNumber as a separate field
        bookTitle,
        author,
        copyright,
        dateIssued,
        dateReturned,
        createdAt: new Date(),
      });

      toast.success('Borrower added successfully');
      onClose();
      // Resetting the form
      setIdNumber('');
      setFullName('');
      setCourseYear('');
      setCallNumber('');
      setBookTitle('');
      setAuthor('');
      setCopyright('');
      setDateIssued('');
      setDateReturned('');
    } catch (error) {
      console.error('Error adding borrower:', error);
      toast.error('Failed to add borrower');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Add New Borrower</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="ID Number"
            className="input-field"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Full Name"
            className="input-field"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="text"
            required
            placeholder="Course & Year"
            className="input-field"
            value={courseYear}
            onChange={(e) => setCourseYear(e.target.value)}
          />

          <div className="flex items-center space-x-2">
            <input
              type="text"
              required
              placeholder="Call Number"
              className="input-field"
              value={callNumber}
              onChange={(e) => handleManualInput('callNumber', e.target.value)} // Handle manual input for callNumber
            />
            <button
              type="button"
              onClick={() => handleFetchBookDetails('callNumber')}
              className="text-gray-500"
            >
              <FaSearch /> {/* Search icon */}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Book Title"
              className="input-field"
              value={bookTitle}
              onChange={(e) => handleManualInput('bookTitle', e.target.value)} // Handle manual input for bookTitle
            />
            <button
              type="button"
              onClick={() => handleFetchBookDetails('bookTitle')}
              className="text-gray-500"
            >
              <FaSearch /> {/* Search icon */}
            </button>
          </div>

          <input
            type="text"
            placeholder="Author"
            className="input-field"
            value={author}
            onChange={(e) => setAuthor(e.target.value)} // Allow typing
          />
          <input
            type="text"
            placeholder="Copyright"
            className="input-field"
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)} // Allow typing
          />

          <input
            type="date"
            placeholder="Date Issued"
            className="input-field"
            value={dateIssued}
            onChange={(e) => setDateIssued(e.target.value)}
          />
          <input
            type="date"
            placeholder="Date Returned"
            className="input-field"
            value={dateReturned}
            onChange={(e) => setDateReturned(e.target.value)}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                setIdNumber('');
                setFullName('');
                setCourseYear('');
                setCallNumber('');
                setBookTitle('');
                setAuthor('');
                setCopyright('');
                setDateIssued('');
                setDateReturned('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Borrower
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
