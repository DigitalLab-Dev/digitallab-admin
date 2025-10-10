import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Add from './pages/Add';
import Orders from './pages/Community';
import List from './pages/List';
import Login from './components/Login';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Team from './pages/Team';
import TurJa from './pages/TurJa';
import FAQ from './pages/FAQ';
import AdminReviewsApp from './pages/Review';

// export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const backendUrl =import.meta.env.VITE_BACKEND_URL|| "http://localhost:4000";
export const currency = '$';
const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem('token') ? localStorage.getItem('token') : ''
  );

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <div className="bg-black min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {token ? (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full  border-orange-400 border-t">
            <Sidebar />
            <div className="w-[70%] max-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/" element={<TurJa token={token} />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/reviews" element={<AdminReviewsApp token={token} />} />
                <Route path="/faq" element={<FAQ token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/community" element={<Orders token={token} />} />
                <Route path="/team" element={<Team token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        <Login setToken={setToken} />
      )}
    </div>
  );
};

export default App;
