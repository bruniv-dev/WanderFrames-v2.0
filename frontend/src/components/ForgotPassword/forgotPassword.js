import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendResetPasswordRequest,
  verifySecurityAnswer,
  forgotPasswordReset,
} from "../api-helpers/helpers";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await sendResetPasswordRequest(identifier);
      setSecurityQuestion(response.securityQuestion);
      setUserId(response.userId);
      localStorage.setItem("userId", response.userId); // Store userId in local storage
      setIsLoading(false);
    } catch (err) {
      console.error("Error requesting password reset:", err);
      setErrorMessage(err.message); // Display error message from backend
      setIsLoading(false);
    }
  };

  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous error message
    try {
      const response = await verifySecurityAnswer(identifier, securityAnswer);
      if (response.isCorrect) {
        setIsVerified(true);
      } else {
        setErrorMessage("Incorrect security answer. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying security answer:", err);
      setErrorMessage("Error verifying security answer. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match. Please re-enter.");
      return;
    }

    // Password validation criteria
    const isValid = validatePassword(newPassword);
    if (!isValid) {
      setPasswordError(
        "Password must contain at least one uppercase letter, one number, one special character, and be at least 8 characters long."
      );
      return;
    }

    setErrorMessage(""); // Clear error message before attempting reset
    setPasswordError(""); // Clear password error message before attempting reset
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setErrorMessage("User ID is missing. Please request a new reset.");
        return;
      }

      await forgotPasswordReset(userId, newPassword);
      alert("Password reset successful. Please log in with your new password.");
      navigate("/loginSignup");
    } catch (err) {
      console.error("Error resetting password:", err);
      setErrorMessage("Failed to reset password. Please try again.");
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  return (
    <div className="container forgotPassword">
      {errorMessage && <div className="error-popup">{errorMessage}</div>}
      {passwordError && <div className="error-popup">{passwordError}</div>}
      {!securityQuestion ? (
        <form onSubmit={handleRequestReset}>
          <h2>Forgot Password</h2>
          <div>
            <label htmlFor="identifier">Username or Email:</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
      ) : !isVerified ? (
        <form onSubmit={handleVerifyAnswer}>
          <h2>Security Question</h2>
          <p>{securityQuestion}</p>
          <div>
            <label htmlFor="securityAnswer">Answer:</label>
            <input
              type="text"
              id="securityAnswer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
          </div>
          <button type="submit">Verify Answer</button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
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
            <label className="forgotPassword" htmlFor="confirmPassword">
              Confirm New Password:
            </label>
            <input
              className="forgotPassword"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button className="forgotPassword" type="submit">
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
