import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [bananaCount, setBananaCount] = useState(Number(localStorage.getItem("bananaCount")) || 0);
  const [timeBreakPowers, setTimeBreakPowers] = useState(Number(localStorage.getItem("timeBreakPowers")) || 0);
  const [extraLifePowers, setExtraLifePowers] = useState(Number(localStorage.getItem("extraLifePowers")) || 0);
  const [doubleScorePowers, setDoubleScorePowers] = useState(Number(localStorage.getItem("doubleScorePowers")) || 0);
  const [shopMsg, setShopMsg] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const dropdownRef = useRef(null);

  const SHOP_ITEMS = [
    { key: "timeBreak", name: "Time Break", icon: "⏳", cost: 10, desc: "Pauses the game timer for 5 seconds." },
    { key: "extraLife", name: "Extra Life", icon: "🛡️", cost: 15, desc: "Grants one additional life instantly." },
    { key: "doubleScore", name: "Double Score", icon: "⚡", cost: 20, desc: "Next correct answer earns double points." }
  ];

  const getPowerCount = (key) => {
    if (key === "timeBreak") return timeBreakPowers;
    if (key === "extraLife") return extraLifePowers;
    return doubleScorePowers;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refresh counts when shop opens
  useEffect(() => {
    if (showShop) {
      setBananaCount(Number(localStorage.getItem("bananaCount")) || 0);
      setTimeBreakPowers(Number(localStorage.getItem("timeBreakPowers")) || 0);
      setExtraLifePowers(Number(localStorage.getItem("extraLifePowers")) || 0);
      setDoubleScorePowers(Number(localStorage.getItem("doubleScorePowers")) || 0);
      setShopMsg("");
    }
  }, [showShop]);

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
    window.dispatchEvent(new CustomEvent("help_overlay_toggle", { detail: { isOpen } }));
  };

  const buyPower = async (powerType, cost) => {
    if (bananaCount < cost) {
      setShopMsg(`❌ Not enough bananas! Need ${cost} 🍌`);
      return;
    }
    try {
      const res = await axios.put(
        "http://localhost:5000/auth/buy-power",
        { powerType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBananaCount(res.data.bananaCount);
      setTimeBreakPowers(res.data.timeBreakPowers);
      setExtraLifePowers(res.data.extraLifePowers);
      setDoubleScorePowers(res.data.doubleScorePowers);
      localStorage.setItem("bananaCount", res.data.bananaCount);
      localStorage.setItem("timeBreakPowers", res.data.timeBreakPowers);
      localStorage.setItem("extraLifePowers", res.data.extraLifePowers);
      localStorage.setItem("doubleScorePowers", res.data.doubleScorePowers);
      setShopMsg(`✅ Purchased successfully!`);
      // Notify Game.jsx to update live
      window.dispatchEvent(new CustomEvent("shop_purchase"));
    } catch (error) {
      setShopMsg(error.response?.data?.message || "Purchase failed");
    }
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
          <button className="nav-item shop-btn" onClick={() => setShowShop(true)}>🛒 Shop</button>
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

      {showShop && (
        <div className="shop-overlay" onClick={() => setShowShop(false)}>
          <div className="shop-modal" onClick={(e) => e.stopPropagation()}>
            <button className="shop-modal-close" onClick={() => setShowShop(false)}>✕</button>
            <h2 className="shop-title">🛒 Power Shop</h2>
            <p className="shop-balance">🍌 Your Bananas: <strong>{bananaCount}</strong></p>

            <div className="shop-items">
              {SHOP_ITEMS.map((item) => (
                <div className="shop-item" key={item.key}>
                  <div className="shop-item-icon">{item.icon}</div>
                  <div className="shop-item-details">
                    <h4>{item.name}</h4>
                    <p>{item.desc}</p>
                    <span className="shop-item-owned">Owned: <strong>{getPowerCount(item.key)}</strong></span>
                  </div>
                  <button 
                    className="shop-buy-btn"
                    disabled={bananaCount < item.cost}
                    onClick={() => buyPower(item.key, item.cost)}
                  >
                    Buy {item.cost} 🍌
                  </button>
                </div>
              ))}
            </div>

            {shopMsg && <p className="shop-msg">{shopMsg}</p>}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
