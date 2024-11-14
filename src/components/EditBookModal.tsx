import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

// Define Book type
interface Book {
  id: string;
  title: string;
  callNumber: string;
  copyright: string;
  availability: number;
  location: string;
  author: string;
  createdAt: Timestamp;  // Use Timestamp here
}

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit: Book | null; // Accept the bookToEdit prop
}

export default function EditBookModal({ isOpen, onClose, bookToEdit }: EditBookModalProps) {
  const [bookData, setBookData] = useState<Book | null>(null);

  useEffect(() => {
    if (bookToEdit) {
      // If bookToEdit is available, use its values to populate the form fields
      setBookData(bookToEdit);
    }
  }, [bookToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (bookData) {
      setBookData({ ...bookData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookData || !bookData.id) return;

    try {
      const bookDocRef = doc(db, 'books-collection', bookData.id);
      await updateDoc(bookDocRef, {
        title: bookData.title,
        author: bookData.author,
        callNumber: bookData.callNumber,
        copyright: bookData.copyright,
        availability: Number(bookData.availability), // Ensure availability is a number
        location: bookData.location,
      });

      toast.success('Book updated successfully');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Error updating book: ' + errorMessage);
    }
  };

  if (!isOpen || !bookData) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-6">
          Edit Book Details
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              className="input-field"
              value={bookData.title}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              name="author"
              required
              className="input-field"
              value={bookData.author}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Call Number</label>
            <input
              type="text"
              name="callNumber"
              required
              className="input-field"
              value={bookData.callNumber}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Year</label>
            <input
              type="text"
              name="copyright"
              required
              className="input-field"
              value={bookData.copyright}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <input
              type="number"
              name="availability"
              required
              className="input-field"
              value={bookData.availability}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              required
              className="input-field"
              value={bookData.location}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
