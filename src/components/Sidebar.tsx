import { Link, useLocation } from 'react-router-dom';
import { BookOpenIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline'; // Correct import for UserIcon

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="h-screen w-64 bg-white text-black fixed left-0 top-0 shadow-md border-r border-gray-200">
      <div className="p-6 flex flex-col items-center border-b border-gray-200">
        <img
          src="/src/logo/CIT logo.png"
          alt="CIT Logo"
          className="w-16 h-16 mb-4"
        />
        <h2 className="text-2xl font-semibold text-gray-800">Library Admin</h2>
      </div>
      <nav className="mt-8">
        {/* Home Link */}
        <Link
          to="/dashboard/home"
          className={`flex items-center px-6 py-3 rounded-md transition-all duration-200 mb-2 ${
            location.pathname === '/dashboard/home'
              ? 'bg-gray-200 text-black font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <HomeIcon className="h-5 w-5 mr-3" />
          <span className="font-medium">Home</span>
        </Link>

        {/* Books Link */}
        <Link
          to="/dashboard/books"
          className={`flex items-center px-6 py-3 rounded-md transition-all duration-200 mb-2 ${
            location.pathname.includes('/dashboard/books')
              ? 'bg-gray-200 text-black font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BookOpenIcon className="h-5 w-5 mr-3" />
          <span className="font-medium">Books</span>
        </Link>

        {/* Borrower Link */}
        <Link
          to="/dashboard/borrower" // Correct route for Borrower section
          className={`flex items-center px-6 py-3 rounded-md transition-all duration-200 mb-2 ${
            location.pathname.includes('/dashboard/borrower')
              ? 'bg-gray-200 text-black font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserIcon className="h-5 w-5 mr-3" />
          <span className="font-medium">Borrower</span>
        </Link>
      </nav>
    </div>
  );
}
