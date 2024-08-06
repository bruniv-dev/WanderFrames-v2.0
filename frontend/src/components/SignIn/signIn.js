import React, { useState, useEffect } from "react";
import "./SignIn.css";
import { useDispatch } from "react-redux";
import { authActions } from "../../store";
import { useNavigate } from "react-router-dom";
import Header from "../Header/header";
import {
  sendAuthRequest,
  checkUsernameAvailability,
} from "../api-helpers/helpers";

const SignInSignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginError, setLoginError] = useState(""); // Separate login error state
  const [signUpError, setSignUpError] = useState(""); // Separate signup error state
  const [usernameStatus, setUsernameStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
    identifier: "",
  });

  useEffect(() => {
    setInputs({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      securityQuestion: "",
      securityAnswer: "",
      identifier: "",
    });
    setLoginError(""); // Clear login error when switching forms
    setSignUpError(""); // Clear signup error when switching forms
  }, [isSignUp]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (isSignUp && inputs.username) {
        try {
          setLoading(true);
          const isAvailable = await checkUsernameAvailability(inputs.username);
          setUsernameStatus(
            isAvailable
              ? "Username is available."
              : "Username is already taken."
          );
        } catch (err) {
          setUsernameStatus("Error checking username availability.");
        } finally {
          setLoading(false);
        }
      } else {
        setUsernameStatus("");
      }
    };

    const debounce = setTimeout(checkAvailability, 300);

    return () => clearTimeout(debounce);
  }, [inputs.username, isSignUp]);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(""); // Reset login error
    setSignUpError(""); // Reset signup error

    // Convert email to lowercase for sign-up
    if (isSignUp) {
      setInputs((prevState) => ({
        ...prevState,
        email: prevState.email.toLowerCase(),
      }));
    }

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (isSignUp && !usernameRegex.test(inputs.username)) {
      setSignUpError(
        "Username can only use letters, numbers, underscores, and periods."
      );
      return;
    }

    // Validate password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (isSignUp && !passwordRegex.test(inputs.password)) {
      setSignUpError(
        "Password should contain at least one uppercase letter, one lowercase letter, one digit, one special symbol, and should be more than 8 characters."
      );
      return;
    }

    if (isSignUp && usernameStatus.includes("taken")) {
      setSignUpError("Username is already taken.");
      return;
    }

    try {
      setLoading(true);

      const data = await sendAuthRequest(isSignUp, inputs);

      if (isSignUp) {
        console.log("Sign-up successful:", data);
        toggleForm(); // Switch to login mode after successful sign-up
      } else {
        const { userId, isAdmin } = data || {};

        if (userId) {
          localStorage.setItem("userId", userId);
        }
        if (isAdmin !== undefined) {
          localStorage.setItem("isAdmin", isAdmin.toString());
        }

        dispatch(authActions.login({ isAdmin }));

        navigate("/");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      if (isSignUp) {
        setSignUpError(
          err.response?.data?.message || "An error occurred. Please try again."
        );
      } else {
        setLoginError(
          err.response?.data?.message || "An error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email" && isSignUp) {
      // Convert email to lowercase
      setInputs((prevState) => ({
        ...prevState,
        email: value.toLowerCase(),
      }));
    } else {
      setInputs((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  return (
    <>
      <Header
        classNameheader="login-header"
        classNamelogo="login-logo"
        classNamenav="login-nav"
        classNamesignin="login-signin"
      />
      <div className="auth">
        <div
          className={`auth-container ${
            isSignUp ? "sign-up-mode" : "sign-in-mode"
          }`}
        >
          <div className="auth-container">
            {!isSignUp && (
              <form className="auth-form sign-in-form" onSubmit={handleSubmit}>
                <h2>Log In</h2>
                {loginError && (
                  <p className="error-message sign-in-error">{loginError}</p>
                )}
                <div className="form-group">
                  <label htmlFor="identifier">Username or Email:</label>
                  <input
                    name="identifier"
                    value={inputs.identifier || ""}
                    onChange={(e) =>
                      setInputs({ ...inputs, identifier: e.target.value })
                    }
                    type="text"
                    id="identifier"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <input
                    name="password"
                    onChange={handleChange}
                    type="password"
                    id="password"
                    required
                  />
                </div>
                <a href="/forgot-password" className="forgot-password">
                  Forgot Password?
                </a>
                <button type="submit" className="signin-btn" disabled={loading}>
                  {loading ? "Logging In..." : "Log In"}
                </button>
              </form>
            )}
          </div>
          <div className="auth-container">
            {isSignUp && (
              <form onSubmit={handleSubmit} className="auth-form sign-up-form">
                <h2>Sign Up</h2>
                {signUpError && (
                  <p className="error-message sign-up-error">{signUpError}</p>
                )}
                <div className="form-group">
                  <div className="first-last">
                    <div>
                      <label htmlFor="firstName">First Name:</label>
                      <input
                        name="firstName"
                        onChange={handleChange}
                        type="text"
                        id="firstName"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName">Last Name:</label>
                      <input
                        name="lastName"
                        onChange={handleChange}
                        type="text"
                        id="lastName"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="username">Username:</label>
                  <input
                    name="username"
                    onChange={handleChange}
                    type="text"
                    id="username"
                    required
                  />
                  <p
                    className={`username-status-message ${
                      usernameStatus.includes("available") ? "available" : ""
                    } ${usernameStatus.includes("taken") ? "taken" : ""}
                    ${usernameStatus.includes("Error") ? "error" : ""}`}
                  >
                    {usernameStatus}
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    name="email"
                    onChange={handleChange}
                    type="email"
                    id="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <input
                    name="password"
                    onChange={handleChange}
                    type="password"
                    id="password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="securityQuestion">Security Question:</label>
                  <select
                    name="securityQuestion"
                    onChange={handleChange}
                    value={inputs.securityQuestion}
                    id="securityQuestion"
                    required
                  >
                    <option value="">Select a question</option>
                    <option value="What is your pet's name?">
                      What is your pet's name?
                    </option>
                    <option value="What is your mother's maiden name?">
                      What is your mother's maiden name?
                    </option>
                    <option value="What was the name of your first school?">
                      What was the name of your first school?
                    </option>
                    <option value="What is your favorite book?">
                      What is your favorite book?
                    </option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="securityAnswer">Security Answer:</label>
                  <input
                    name="securityAnswer"
                    onChange={handleChange}
                    type="text"
                    id="securityAnswer"
                    required
                  />
                </div>
                <button type="submit" className="signin-btn" disabled={loading}>
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </form>
            )}
          </div>
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h2>Hello there!</h2>
                <p>Start your journey with us by creating an account.</p>
                <button className="auth-btn" onClick={toggleForm}>
                  Sign Up
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h2>Welcome Back!</h2>
                <p>To stay connected, please log in to your account.</p>
                <button className="auth-btn" onClick={toggleForm}>
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInSignUp;
