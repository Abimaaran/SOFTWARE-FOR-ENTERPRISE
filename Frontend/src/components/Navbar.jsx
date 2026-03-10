import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("highScore");
    navigate("/");
  };

  if (!token) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/game">🍌 Banana Game</Link>
      </div>
      <div className="nav-links">
        <Link to="/selection" className="nav-item">Play</Link>
        <Link to="/leaderboard" className="nav-item">Leaderboard</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
