import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import emailjs from "@emailjs/browser";
import "./Forgot.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your registered email.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/auth/forgot-password", { email });
      const { otp } = res.data;

      const templateParams = {
        email: email,
        otp: otp,
        time: "15 minutes"
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSuccess("OTP sent successfully! Check your inbox.");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find account. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h1 className="forgot-title">🍌 Forgot Password</h1>
        <p className="forgot-subtitle">
          Don't worry! Enter your email below and we'll send you a special code to reset your password.
        </p>

        {error && <div className="status-msg error">{error}</div>}
        {success && <div className="status-msg success">{success}</div>}

        <form onSubmit={handleSendOTP} className="forgot-form">
          <div className="forgot-input-group">
            <label>Email Address</label>
            <div className="forgot-field-wrap">
              <span className="field-icon">📧</span>
              <input
                type="email"
                className="forgot-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="action-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Code 🚀"}
          </button>
        </form>

        <div className="back-link" onClick={() => navigate("/")}>
          <span>←</span> Back to Login
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
