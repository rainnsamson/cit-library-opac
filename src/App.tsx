import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import Home from './components/Home'; // Import the Home component

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="home" element={<Home />} /> {/* Home route inside Dashboard */}
            <Route path="books" element={<BookList />} />
            <Route index element={<Navigate to="home" replace />} /> {/* Redirect to Home */}
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
