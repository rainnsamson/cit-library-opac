// Dashboard.tsx
import Sidebar from './Sidebar';
import Header from './Header'; // Import the Header component
import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="flex bg-[#F5F5F7] min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1"> {/* Reduced margin to bring content closer */}
        <Header /> {/* Include the Header component here */}
        <Outlet />
      </div>
    </div>
  );
}
