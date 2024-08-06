import React, { useState } from "react";
import "./ResetPassword.css";

const ResetPassword = ({ onClose, onResetPassword, loading, error }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password validation criteria
    const isValid = validatePassword(newPassword);
    if (!isValid) {
      setPasswordError(
        "Password must contain at least one uppercase letter, one number, one special character, and be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    onResetPassword(oldPassword, newPassword);
  };

  // Password validation function
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  return (
    <div className="reset-password-modal">
      <form onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <div>
          <label htmlFor="oldPassword">Old Password:</label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {passwordError && <p className="error-message">{passwordError}</p>}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Reset Password"}
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
