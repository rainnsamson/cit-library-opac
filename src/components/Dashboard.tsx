import Sidebar from './Sidebar';
import Header from './Header'; // Import the Header component
import { Outlet } from 'react-router-dom';
import ChatIcon from './ChatIcon'; // Import the ChatIcon component
import ChatBox from './ChatBox'; // Import the ChatBox component

export default function Dashboard() {
  return (
    <div className="flex bg-[#F5F5F7] min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1"> {/* Reduced margin to bring content closer */}
        <Header /> {/* Include the Header component here */}
        <Outlet />
      </div>
      <ChatIcon onClick={() => {}} /> {/* Placeholder for ChatIcon */}
      <ChatBox /> {/* ChatBox will display when the icon is clicked */}
    </div>
  );
}
