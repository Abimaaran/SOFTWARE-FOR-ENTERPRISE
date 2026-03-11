import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import emailjs from "@emailjs/browser";
import "./Forgot.css";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/auth/verify-otp", { email, otp });
      navigate("/reset-password", { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/auth/forgot-password", { email });
      const { otp: newOtp } = res.data;

      const templateParams = {
        email: email,
        otp: newOtp,
        time: "15 minutes"
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      alert("New OTP sent to your email!");
    } catch (err) {
      setError("Could not resend OTP. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h1 className="forgot-title">🔢 Verify Code</h1>
        <p className="forgot-subtitle">
          Please enter the security code sent to:
          <span className="otp-display-email">{email}</span>
        </p>

        {error && <div className="status-msg error">{error}</div>}

        <form onSubmit={handleVerify} className="forgot-form">
          <div className="forgot-input-group">
            <label>6-Digit OTP</label>
            <div className="forgot-field-wrap">
              <span className="field-icon">🔑</span>
              <input
                type="text"
                className="forgot-input"
                placeholder="000000"
                maxLength="6"
                style={{textAlign: 'center', letterSpacing: '4px', fontSize: '20px', fontWeight: 'bold'}}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
          </div>

          <button type="submit" className="action-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Continue ✅"}
          </button>
        </form>

        <div className="resend-box">
          Didn't receive the code? 
          <button className="resend-btn" onClick={handleResend} disabled={resendLoading}>
             {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        <div className="back-link" onClick={() => navigate("/")}>
          <span>←</span> Back to Login
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
