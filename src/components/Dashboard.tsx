import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure your Firebase configuration is correct
import { HiLogout } from 'react-icons/hi'; // Importing logout icon from react-icons

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign out method
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-red-50 via-white to-red-50 min-h-screen">
      <Sidebar />
      <div className="ml-72 flex-1">
        {/* Logout Icon */}
        <div className="flex justify-end p-4">
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800">
            <HiLogout className="w-6 h-6" />
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
