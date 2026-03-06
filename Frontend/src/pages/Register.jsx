import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const navigate = useNavigate();

  // Password strength checker
  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const passwordStrength = getPasswordStrength();

  const handleRegister = async () => {
    // Validation
    if (!username || !email || !password) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please fill in all fields 🍌'
      });
      return;
    }

    if (!acceptTerms) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please accept the terms and conditions 📝'
      });
      return;
    }

    if (password.length < 6) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Password must be at least 6 characters 🔒'
      });
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      await axios.post("http://localhost:5000/auth/register", {
        username,
        email,
        password
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Registration Successful! 🎉'
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Registration Failed ❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="page">
      {/* Animated Background Elements */}
      <div className="floating-banana banana-1">🍌</div>
      <div className="floating-banana banana-2">🍌</div>
      <div className="floating-banana banana-3">🍌</div>
      <div className="floating-banana banana-4">🍌</div>
      
      <div className="peel peel-1">🍌</div>
      <div className="peel peel-2">🍌</div>
      <div className="peel peel-3">🍌</div>
      
      <div className="star star-1">⭐</div>
      <div className="star star-2">⭐</div>

      <div className="register-wrap">
        <h1 className="register-title">
          <span>🍌</span>
          Register
          <span>🍌</span>
        </h1>
        <div className="register-subtitle">Join the banana family!</div>

        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="register-form">
          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              className="register-input"
              type="text"
              placeholder="Choose username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="register-input"
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
                className="register-input"
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
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
            
            {/* Password Strength Indicator */}
            {password && (
              <>
                <div className="password-strength">
                  <div className={`strength-bar ${passwordStrength}`}></div>
                </div>
                <div className={`strength-text ${passwordStrength}`}>
                  {passwordStrength === 'weak' && 'Weak password'}
                  {passwordStrength === 'medium' && 'Medium password'}
                  {passwordStrength === 'strong' && 'Strong password'}
                </div>
              </>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="terms">
              I accept <a href="#">Terms</a> & <a href="#">Privacy</a>
            </label>
          </div>

          <button 
            className="register-btn" 
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="login-section">
            <p className="login-text">Already have an account?</p>
            <button 
              className="login-btn"
              onClick={() => navigate("/")}
              disabled={loading}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;