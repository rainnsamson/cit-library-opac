import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">Welcome to Your Dashboard</h1>
          <p className="mt-4 text-lg text-gray-600">Manage your library, view books, and track your progress.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick Links Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800">Quick Links</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/dashboard/books" className="text-blue-600 hover:underline">
                  View Book List
                </a>
              </li>
              <li>
                <a href="/dashboard/home" className="text-blue-600 hover:underline">
                  Dashboard Home
                </a>
              </li>
              <li>
                <a href="/login" className="text-blue-600 hover:underline">
                  Logout
                </a>
              </li>
            </ul>
          </div>

          {/* Your Library Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800">Your Library</h2>
            <p className="mt-4 text-gray-600">Start managing and adding books to your collection today!</p>
            <button className="mt-6 w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-300">
              Add New Book
            </button>
          </div>

          {/* Additional Card (Placeholder for more content) */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800">Additional Card</h2>
            <p className="mt-4 text-gray-600">Use this space to add any additional content or features.</p>
            <button className="mt-6 w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-300">
              Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
