import { useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

// Define Book type
interface Book {
  title: string;
  callNumber: string;
  copyright: string;
  availability: number;
  location: string;
  author: string;
  createdAt: Date;
}

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const [author, setAuthor] = useState('');
  const [bookTitles, setBookTitles] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Split the input by newline and process each line
    const booksData: Book[] = bookTitles.split('\n').map((line) => {
      const match = line.match(/^(.+?),\s?\((\d+)\),\s?\((\d{4})\),\s?\((\d+)\),\s?\((.+?)\)$/); // Regex to match Title, (Call Number), (Copyright Year), (Availability), (Location)

      if (match) {
        const [, title, callNumber, copyright, availability, location] = match;
        return {
          title: title.trim(),
          callNumber: callNumber.trim(),
          copyright: copyright.trim(),
          availability: Number(availability.trim()), // Convert availability to a number
          location: location.trim(), // Add location
          author: author.trim(), // Add the author's name
          createdAt: new Date(),
        };
      } else {
        return null; // Invalid format, ignore
      }
    }).filter(Boolean) as Book[]; // Typecast to Book[] after filtering out null values

    if (booksData.length === 0) {
      toast.error('Please enter valid book details in the correct format');
      return;
    }

    try {
      const booksCollectionRef = collection(db, 'books-collection');
      
      // Check for duplicates in Firestore
      const querySnapshot = await getDocs(booksCollectionRef);
      for (const book of booksData) {
        const duplicateBook = querySnapshot.docs.find(doc => doc.data().callNumber === book.callNumber && doc.data().title === book.title);
        
        if (duplicateBook) {
          toast.error(`Book with title "${book.title}" and call number "${book.callNumber}" already exists.`);
          return; // Exit the function if duplicate is found
        }
      }

      // If no duplicates, add the books
      for (const book of booksData) {
        await addDoc(booksCollectionRef, book);
      }

      toast.success('Books added successfully');
      onClose();
      setAuthor('');
      setBookTitles('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Error adding books: ' + errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
          Add Books for Author
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
            <input
              type="text"
              required
              className="input-field"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Book Titles (Title, (Call Number), (Copyright), (Availability), (Location))</label>
            <textarea
              rows={5}
              required
              className="input-field"
              value={bookTitles}
              onChange={(e) => setBookTitles(e.target.value)}
              placeholder="Enter each book on a new line (e.g., Taxation, (123), (2024), (5), (Shelf A))"
              maxLength={2000}  // Adjusted for approximately 10-20 entries
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Books
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
