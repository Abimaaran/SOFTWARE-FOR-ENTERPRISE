import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to game selection
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/selection");
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please fill in all fields 🍌'
      });
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password
      });

      const token = res.data.token;
      const { highScoreEasy, highScoreHard } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("highScoreEasy", highScoreEasy);
      localStorage.setItem("highScoreHard", highScoreHard);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("bananaCount", res.data.bananaCount);
      localStorage.setItem("timeBreakPowers", res.data.timeBreakPowers);
      localStorage.setItem("extraLifePowers", res.data.extraLifePowers);
      localStorage.setItem("doubleScorePowers", res.data.doubleScorePowers);

      setAlert({
        show: true,
        type: 'success',
        message: 'Login Successful! 🎉'
      });

      setTimeout(() => {
        navigate("/selection");
      }, 1500);

    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Login Failed ❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="page">
      {/* Animated Background Elements */}
      <div className="floating-banana banana-1">🍌</div>
      <div className="floating-banana banana-2">🍌</div>
      <div className="floating-banana banana-3">🍌</div>
      <div className="floating-banana banana-4">🍌</div>
      <div className="floating-banana banana-5">🍌</div>
      <div className="floating-banana banana-6">🍌</div>
      
      <div className="peel peel-1">🍌</div>
      <div className="peel peel-2">🍌</div>
      <div className="peel peel-3">🍌</div>
      <div className="peel peel-4">🍌</div>
      
      <div className="star star-1">⭐</div>
      <div className="star star-2">⭐</div>
      <div className="star star-3">⭐</div>

      <div className="login-wrap">
        <h1 className="login-title">
          <span>🍌</span>
          Login
          <span>🍌</span>
        </h1>
        <div className="login-subtitle">Welcome back! Peel the fun 🍌</div>

        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="login-form">
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-container">
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <span onClick={() => navigate("/forgot-password")} className="link">Forgot Password?</span>
          </div>

          <button 
            className="login-btn" 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="signup-section">
            <p className="signup-text">Don't have an account?</p>
            <button 
              className="signup-btn"
              onClick={() => navigate("/register")}
              disabled={loading}
            >
              Create Account 🍌
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;