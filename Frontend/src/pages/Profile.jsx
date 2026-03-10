import { useState } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {
  // Fix for "undefined" string in localStorage
  const getStored = (key) => {
    const val = localStorage.getItem(key);
    return (val === "undefined" || val === "null") ? "" : (val || "");
  };

  const [username, setUsername] = useState(getStored("username"));
  const [email, setEmail] = useState(getStored("email"));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (showPasswordForm && password !== confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match!" });
      return;
    }
    
    setLoading(true);
    setMsg({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const updateData = { username, email };
      if (showPasswordForm && password) updateData.password = password;

      const res = await axios.put(
        "http://localhost:5000/auth/update-profile",
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMsg({ type: "success", text: res.data.message });
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);
      setPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page profile-page">
      <div className="profile-wrap">
        <h1 className="profile-title">👤 User Profile</h1>
        <p className="profile-subtitle">Update your banana account details!</p>

        {msg.text && <div className={`profile-alert ${msg.type}`}>{msg.text}</div>}

        <form className="profile-form" onSubmit={handleUpdate}>
          <div className="profile-info-section">
            <div className="info-item">
              <span className="info-label">Current Name:</span>
              <span className="info-value">{username || "Not set"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Email:</span>
              <span className="info-value">{email || "Not set"}</span>
            </div>
          </div>

          <div className="input-group">
            <label>Change Name</label>
            <input
              type="text"
              placeholder="Enter new name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Change Email</label>
            <input
              type="email"
              placeholder="Enter new email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {!showPasswordForm ? (
            <button 
              type="button" 
              className="change-pass-toggle"
              onClick={() => setShowPasswordForm(true)}
            >
              🔒 Change Password
            </button>
          ) : (
            <div className="password-fields-wrap animation-down">
              <div className="input-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button 
                type="button" 
                className="cancel-pass-btn"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </button>
            </div>
          )}

          <button className="profile-btn" disabled={loading}>
            {loading ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
