import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "./Login.css"; // Reuse login styles

function MFASetup() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isSetupInitiated, setIsSetupInitiated] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const navigate = useNavigate();
  const authToken = localStorage.getItem("token");

  useEffect(() => {
    if (!authToken) {
      navigate("/");
      return;
    }
    fetchMfaStatus();
  }, [authToken, navigate]);

  const fetchMfaStatus = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/status", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setIsMfaEnabled(res.data.mfaEnabled);
    } catch (err) {
      console.error("Failed to fetch MFA status", err);
    }
  };

  const initiateSetup = async () => {
    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const res = await axios.post("http://localhost:5000/auth/mfa/setup", {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const { otp, email } = res.data;

      // Send OTP via EmailJS
      const templateParams = {
        email: email,
        otp: otp,
        time: "15 minutes",
        action_name: "Enable MFA",
        message_text: "to enable Multi-Factor Authentication (MFA) on your account"
      };

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (err) {
        console.error("EmailJS failed:", err);
      }

      setIsSetupInitiated(true);
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Failed to initiate setup ❌'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!token || token.length !== 6) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter the 6-digit OTP 🍌'
      });
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/auth/mfa/verify-setup", {
        token
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setIsMfaEnabled(true);
      setAlert({
        show: true,
        type: 'success',
        message: 'MFA Enabled Successfully! 🔒'
      });

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
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

  const handleDisableMFA = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/auth/mfa/disable", {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setIsMfaEnabled(false);
      setAlert({
        show: true,
        type: 'success',
        message: 'MFA Disabled Successfully! 🔓'
      });
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Failed to disable MFA ❌'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="login-wrap">
        <h1 className="login-title">
          <span>🔒</span>
          MFA Setup
          <span>🔒</span>
        </h1>
        <div className="login-subtitle">Secure your account with Multi-Factor Authentication 🍌</div>

        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="login-form">
          {isMfaEnabled ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🛡️✅</div>
              <p style={{ color: "white", marginBottom: "20px" }}>Multi-Factor Authentication is currently **ENABLED**.</p>
              <button
                className="login-btn"
                style={{ backgroundColor: "#d9534f" }}
                onClick={handleDisableMFA}
                disabled={loading}
              >
                {loading ? 'Disabling...' : 'Disable MFA'}
              </button>
            </div>
          ) : !isSetupInitiated ? (
            <button
              className="login-btn"
              onClick={initiateSetup}
              disabled={loading}
            >
              {loading ? 'Initiating...' : 'Enable Email MFA'}
            </button>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <p style={{ color: "white", marginBottom: "10px" }}>A 6-digit code has been sent to your email.</p>
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📧</div>
              </div>

              <div className="input-group">
                <label className="input-label">Enter OTP to verify</label>
                <input
                  className="login-input"
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                />
              </div>

              <button
                className="login-btn"
                onClick={handleVerifySetup}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </>
          )}

          <div className="forgot-password">
            <span onClick={() => navigate("/profile")} className="link">Back to Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MFASetup;
