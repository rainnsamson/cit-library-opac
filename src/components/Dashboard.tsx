import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { HiLogout, HiBell } from 'react-icons/hi'; // Importing bell and logout icons
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Firestore instance
import { ToastContainer, toast } from 'react-toastify'; // Toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Toast CSS

export default function Dashboard() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<{ name: string, dueDate: string }[]>([]); // Store name and dueDate
  const [loading, setLoading] = useState<boolean>(true);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [notificationCountVisible, setNotificationCountVisible] = useState<boolean>(true); // Track notification count visibility
  const [toastShown, setToastShown] = useState<boolean>(false); // Track if the toast is shown

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign-out method
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Real-time listener for overdue borrowers
  useEffect(() => {
    const borrowersRef = collection(db, 'borrowers');

    // Today's date in 'YYYY-MM-DD' format for comparison
    const today = new Date().toISOString().split('T')[0];
    const q = query(borrowersRef, where('dateReturned', '<=', today));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const overdueNotifications: { name: string, dueDate: string }[] = [];

      querySnapshot.forEach((doc) => {
        const borrower = doc.data();
        if (borrower.dateReturned) {
          const dueDate = borrower.dateReturned; // Treat dateReturned as due date
          const returnedDate = borrower.dateReturned; // Assume stored as 'YYYY-MM-DD' string

          if (returnedDate <= today) {
            // Use the dueDate directly
            overdueNotifications.push({
              name: borrower.fullName,
              dueDate: dueDate
            });
          }
        }
      });

      setNotifications(overdueNotifications);
      setLoading(false);

      // Only show the toast once, when there are overdue notifications
      if (!toastShown && overdueNotifications.length > 0) {
        toast.info(`You have ${overdueNotifications.length} overdue notification${overdueNotifications.length > 1 ? 's' : ''}.`);
        setToastShown(true); // Mark toast as shown
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, [toastShown]); // Re-run the effect if toastShown state changes

  // Toggle dropdown visibility when bell icon is clicked
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (notificationCountVisible) {
      setNotificationCountVisible(false); // Hide the notification count when the dropdown is opened
    }
  };

  return (
    <div className="flex bg-[#F5F5F7] min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1">
        {/* Notification and Logout Icons */}
        <div className="flex justify-end p-4 space-x-4 relative">
          <button
            className="relative"
            onClick={toggleDropdown}
            aria-label="Notifications"
          >
            {/* Black bell icon */}
            <HiBell className="w-6 h-6 text-black hover:text-gray-800" />
            {/* Smaller notification count on top of bell icon */}
            {notificationCountVisible && notifications.length > 0 && (
              <span className="absolute bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center top-0 right-0 translate-x-1/2 -translate-y-1/2">
                {notifications.length}
              </span>
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-12 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
              <h3 className="font-bold mb-2 text-gray-800">Overdue Notifications</h3>
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : notifications.length > 0 ? (
                <ul className="space-y-2">
                  {notifications.map((notif, index) => (
                    <li key={index} className="p-2 border-b border-gray-300 text-gray-700">
                      {/* Display Borrower's Name and Due Date */}
                      <div className="font-semibold">Borrower: {notif.name}</div>
                      <div className="font-semibold"><span className="font-semibold">Due Date:</span> {notif.dueDate}</div> {/* Semi-Bolded Due Date */}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-green-600">No overdue borrowers at the moment.</div>
              )}
            </div>
          )}
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800">
            <HiLogout className="w-6 h-6" />
          </button>
        </div>

        <Outlet />
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={true}
      />
    </div>
  );
}
