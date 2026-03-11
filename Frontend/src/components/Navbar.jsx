import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("highScore", "0");
    localStorage.setItem("highScoreEasy", "0");
    localStorage.setItem("highScoreHard", "0");
    setDropdownOpen(false);
    navigate("/");
  };


  const toggleHelp = (isOpen) => {
    setShowHelp(isOpen);
    // Dispatch custom event to notify components (like Game) to pause/resume
    window.dispatchEvent(new CustomEvent("help_overlay_toggle", { detail: { isOpen } }));
  };

  if (!token) return null;

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/selection">🍌 Banana Quiz </Link>
        </div>
        <div className="nav-links">
          <Link to="/selection" className="nav-item">Play</Link>
          <button className="nav-item help-btn" onClick={() => toggleHelp(true)}>Help</button>

          <div className="profile-menu" ref={dropdownRef}>
            <button
              className="profile-icon"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="Profile"
            >
              👤
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/activity" className="dropdown-item" onClick={() => setDropdownOpen(false)}>User Activity</Link>
                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showHelp && (
        <div className="help-overlay" onClick={() => toggleHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-help" onClick={() => toggleHelp(false)}>×</button>
            <h2>How to Play 🍌</h2>
            <div className="help-content">
              <div className="help-step">
                <span className="step-num">1</span>
                <p>Choose your difficulty: <strong>Easy</strong> (No timer, 5 lives), <strong>Medium</strong> (50s, 3 lives) or <strong>Hard</strong> (20s, 2 lives).</p>
              </div>
              <div className="help-step">
                <span className="step-num">2</span>
                <p>Observe the hidden numbers behind the bananas in the puzzle.</p>
              </div>
              <div className="help-step">
                <span className="step-num">3</span>
                <p>Solve the arithmetic logic to find the value of the final question mark.</p>
              </div>
              <div className="help-step">
                <span className="step-num">4</span>
                <p>Type your answer in the box and press <strong>Enter</strong> to submit!</p>
              </div>
            </div>
            <button className="got-it-btn" onClick={() => toggleHelp(false)}>Got it!</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
