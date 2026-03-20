import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css"; // Reuse login styles for consistency

function MFAVerify() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};

  if (!userId) {
    navigate("/");
    return null;
  }

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid 6-digit OTP 🍌'
      });
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const res = await axios.post("http://localhost:5000/auth/mfa/verify-login", {
        userId,
        token
      });

      const { token: jwtToken, highScoreEasy, highScoreHard, username, email, bananaCount, timeBreakPowers, extraLifePowers, doubleScorePowers } = res.data;
      
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("highScoreEasy", highScoreEasy);
      localStorage.setItem("highScoreHard", highScoreHard);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("bananaCount", bananaCount);
      localStorage.setItem("timeBreakPowers", timeBreakPowers);
      localStorage.setItem("extraLifePowers", extraLifePowers);
      localStorage.setItem("doubleScorePowers", doubleScorePowers);

      setAlert({
        show: true,
        type: 'success',
        message: 'MFA Verified! Logging in... 🎉'
      });

      setTimeout(() => {
        navigate("/selection");
      }, 1500);

    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Verification Failed ❌'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="login-wrap">
        <h1 className="login-title">
          <span>🛡️</span>
          MFA Verification
          <span>🛡️</span>
        </h1>
        <div className="login-subtitle">
          Enter the 6-digit code sent to: <br />
          <strong style={{ color: "#8B4513" }}>{email}</strong>
        </div>

        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="login-form">
          <div className="input-group">
            <label className="input-label">6-Digit OTP</label>
            <input
              className="login-input"
              type="text"
              maxLength="6"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              autoFocus
            />
          </div>

          <button 
            className="login-btn" 
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <div className="forgot-password">
            <span onClick={() => navigate("/")} className="link">Back to Login</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MFAVerify;
