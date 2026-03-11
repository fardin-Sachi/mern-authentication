import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerifyOtpPage from './pages/VerifyOtpPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/verify-otp" element={<VerifyOtpPage />} />

        </Routes>
      </BrowserRouter>

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        newestOnTop={true} 
        pauseOnHover
        closeOnClick
      />
    </>
  );
}

export default App