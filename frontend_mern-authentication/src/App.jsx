import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import { AppData } from "./contexts/AppContext";
import LoaderComponent from "./components/LoaderComponent";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

function App() {
  const { isAuth, loading, userEmail } = AppData();

  return (
    <>
      {loading ? (
        <LoaderComponent />
      ) : (
        <BrowserRouter>
          <Routes>

            <Route
              path="/"
              element={
                isAuth ? <HomePage /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/login"
              element={
                !isAuth ? <LoginPage /> : <Navigate to="/" />
              }
            />

            <Route
              path="/register"
              element={
                !isAuth ? <RegisterPage /> : <Navigate to="/" />
              }
            />

            <Route
              path="/verify-otp"
              element={
                !isAuth && userEmail ? <VerifyOtpPage /> : <Navigate to="/" />
              }
            />

            <Route
              path="/token/:token"
              element={
                !isAuth ? <VerifyEmailPage /> : <Navigate to="/" />
              }
            />

            <Route
              path="/dashboard"
              element={
                isAuth ? <DashboardPage /> : <LoginPage />
              }
            />
            
          </Routes>
        </BrowserRouter>
      )}

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

export default App;