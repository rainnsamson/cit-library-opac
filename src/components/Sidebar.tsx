import { Link, useLocation } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="h-screen w-72 bg-gradient-to-b from-red-900 to-red-800 text-white fixed left-0 top-0 shadow-xl">
      <div className="p-6 flex flex-col items-center">
        <img 
          src="/src/logo/CIT logo.png" 
          alt="CIT Logo" 
          className="w-16 h-16 mb-4"  // Adjust size and spacing as needed
        />
        <h2 className="text-2xl font-bold text-white">Library Admin</h2>
      </div>
      <nav className="mt-8 px-4">
        <Link
          to="/dashboard/books"
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
            location.pathname.includes('/books')
              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
              : 'text-gray-300 hover:bg-white/10'
          }`}
        >
          <BookOpenIcon className="h-5 w-5 mr-3" />
          <span className="font-medium">Books</span>
        </Link>
      </nav>
    </div>
  );
}
