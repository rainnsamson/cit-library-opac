import { HiLogout, HiBell } from 'react-icons/hi';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface BorrowerNotification {
  id: string;
  fullName: string;
  dateReturned: string;
}

const Header = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<BorrowerNotification[]>([]);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const bellRef = useRef<HTMLButtonElement | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatToYYYYMMDD = (date: string | Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const borrowersRef = collection(db, 'borrowers');
    const today = formatToYYYYMMDD(new Date());

    const q = query(borrowersRef, where('dateReturned', '==', today));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications: BorrowerNotification[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: data.fullName as string,
          dateReturned: data.dateReturned as string,
        };
      });

      // Update notifications
      setNotifications(fetchedNotifications);

      // Update unread count if new notifications are detected
      if (fetchedNotifications.length > notifications.length) {
        const newCount = fetchedNotifications.length - notifications.length;
        setUnreadCount((prev) => prev + newCount);

        // Show a temporary notification for the number of new notifications
        setRecentNotification(`You have ${newCount} new notification${newCount > 1 ? 's' : ''}.`);
        setTimeout(() => setRecentNotification(null), 5000);
      }
    });

    return () => unsubscribe();
  }, [notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !bellRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle bell click
  const handleBellClick = () => {
    setDropdownOpen((prev) => !prev); // Toggle dropdown
    if (!isDropdownOpen) {
      setUnreadCount(0); // Clear unread count when dropdown is opened
    }
  };

  return (
    <div className="flex justify-end p-4 space-x-4">
      {/* Temporary Notification (Message-style Popup) */}
      {recentNotification && (
        <div
          className="fixed top-12 right-16 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          style={{ borderRadius: '12px', transform: 'translateX(10px)', maxWidth: '300px' }}
        >
          <div className="relative">
            <div className="absolute -top-2 right-4 text-blue-600 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-blue-600 transform rotate-45"></div>
            <p>{recentNotification}</p>
          </div>
        </div>
      )}

      {/* Notification Icon */}
      <div className="relative" ref={dropdownRef}>
        <button
          ref={bellRef}
          onClick={handleBellClick}
          className="text-gray-600 hover:text-gray-800 relative"
        >
          <HiBell className="w-6 h-6" />
          {/* Notification badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        {/* Notification Dropdown */}
        {isDropdownOpen && notifications.length > 0 && (
          <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg w-64 z-50 transition-all ease-in-out duration-300 opacity-100">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className="px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                >
                  <HiBell className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <p className="font-semibold">{notif.fullName}</p>
                    <p className="text-xs text-gray-500">
                      Needs to return the book today ({notif.dateReturned})
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Logout Icon */}
      <button onClick={handleLogout} className="text-red-600 hover:text-red-800">
        <HiLogout className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Header;
