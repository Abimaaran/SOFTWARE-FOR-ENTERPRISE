import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/game" 
            element={
              <ProtectedRoute>
                <Game />
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
    </div>
  );
}

export default App;

