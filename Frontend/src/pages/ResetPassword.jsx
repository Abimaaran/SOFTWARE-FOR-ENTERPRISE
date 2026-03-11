import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Forgot.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/auth/reset-password", { 
        email, 
        otp, 
        newPassword: password 
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Session might have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-container">
        <div className="forgot-card success-card">
          <span className="confetti-icon">🎉</span>
          <h1 className="forgot-title">All Set!</h1>
          <p className="forgot-subtitle">
            Your password has been reset successfully. You can now login with your new credentials.
          </p>
          <div className="status-msg success" style={{marginBottom: '0'}}>Redirecting to Login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h1 className="forgot-title">🔒 New Password</h1>
        <p className="forgot-subtitle">
          Choose a strong password to keep your banana account safe!
        </p>

        {error && <div className="status-msg error">{error}</div>}

        <form onSubmit={handleReset} className="forgot-form">
          <div className="forgot-input-group">
            <label>New Password</label>
            <div className="forgot-field-wrap">
              <span className="field-icon">🔑</span>
              <input
                type="password"
                className="forgot-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="forgot-input-group">
            <label>Confirm Password</label>
            <div className="forgot-field-wrap">
              <span className="field-icon">🛡️</span>
              <input
                type="password"
                className="forgot-input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="action-btn" disabled={loading}>
            {loading ? "Saving..." : "Reset Password 🔒"}
          </button>
        </form>

        <div className="back-link" onClick={() => navigate("/")}>
          <span>←</span> Back to Login
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
