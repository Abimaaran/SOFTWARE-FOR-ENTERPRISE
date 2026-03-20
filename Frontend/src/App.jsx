import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import MFAVerify from "./pages/MFAVerify";
import MFASetup from "./pages/MFASetup";
import GameSelection from "./pages/GameSelection";
import Profile from "./pages/Profile";
import UserActivity from "./pages/UserActivity";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import IntroVideo from "./components/IntroVideo";
import { useState, useEffect } from "react";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Check if intro has already played in this session
    if (sessionStorage.getItem("introPlayed")) {
      setShowIntro(false);
    }
  }, []);

  const handleVideoEnd = () => {
    setShowIntro(false);
  };

  return (
    <div className="app-container">
      {showIntro ? (
        <IntroVideo onVideoEnd={handleVideoEnd} />
      ) : (
        <>
          <Navbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-mfa" element={<MFAVerify />} />
              <Route
                path="/mfa-setup"
                element={
                  <ProtectedRoute>
                    <MFASetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/selection"
                element={
                  <ProtectedRoute>
                    <GameSelection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game/:difficulty"
                element={
                  <ProtectedRoute>
                    <Game />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <ProtectedRoute>
                    <UserActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />


              
            </Routes>
            
          </div>
        </>
      )}
    </div>
  );
}

export default App;
