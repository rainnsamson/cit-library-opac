import { useState, useEffect } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { auth } from '../firebase'; // Import Firebase auth
import { onAuthStateChanged } from 'firebase/auth'; // Firebase auth method

interface Book {
  title: string;
  callNumber: string;
  copyright: string;
  availability: number;
  location: string;
  author: string;
  createdAt: Date;
  imageUrl: string; // Add imageUrl to the Book type
}

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const [author, setAuthor] = useState('');
  const [bookTitles, setBookTitles] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Track the image URL
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // UseEffect to detect user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Don't render modal if not authenticated or modal isn't open
  if (!isOpen || !isAuthenticated) return null;

  // Handle form submission to add books to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Split book titles input into individual books and parse them
    const booksData: Book[] = bookTitles.split('\n').map((line) => {
      const match = line.match(/^(.+?),\s?\((\d+)\),\s?\((\d{4})\),\s?\((\d+)\),\s?\((.+?)\)$/);

      if (match) {
        const [, title, callNumber, copyright, availability, location] = match;
        return {
          title: title.trim(),
          callNumber: callNumber.trim(),
          copyright: copyright.trim(),
          availability: Number(availability.trim()),
          location: location.trim(),
          author: author.trim(),
          createdAt: new Date(),
          imageUrl: imageUrl.trim(), // Use the provided image URL
        };
      } else {
        return null;
      }
    }).filter(Boolean) as Book[];

    // Check if there are any valid book details
    if (booksData.length === 0) {
      toast.error('Please enter valid book details in the correct format');
      return;
    }

    try {
      const booksCollectionRef = collection(db, 'books-collection');

      // Get all books in Firestore to check for duplicates
      const querySnapshot = await getDocs(booksCollectionRef);

      // Check for duplicate books before saving
      for (const book of booksData) {
        const duplicateBook = querySnapshot.docs.find(
          (doc) => doc.data().callNumber === book.callNumber && doc.data().title === book.title
        );

        if (duplicateBook) {
          toast.error(`Book with title "${book.title}" and call number "${book.callNumber}" already exists.`);
          return;
        }
      }

      // Add the new books to Firestore
      for (const book of booksData) {
        await addDoc(booksCollectionRef, book);
      }

      toast.success('Books added successfully');
      onClose(); // Close the modal after successful addition

      // Reset input fields
      setAuthor('');
      setBookTitles('');
      setImageUrl('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error adding books:', errorMessage); // Log error to console
      toast.error('Error adding books: ' + errorMessage); // Show error toast
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              className="input-field"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter the image URL (e.g., https://example.com/image.jpg)"
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
