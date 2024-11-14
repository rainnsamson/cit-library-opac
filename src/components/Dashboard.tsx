import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { HiLogout, HiBell } from 'react-icons/hi'; // Importing bell and logout icons

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
        {/* Notification and Logout Icons */}
        <div className="flex justify-end p-4 space-x-4">
          <button className="text-gray-600 hover:text-gray-800">
            <HiBell className="w-6 h-6" />
          </button>
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800">
            <HiLogout className="w-6 h-6" />
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
