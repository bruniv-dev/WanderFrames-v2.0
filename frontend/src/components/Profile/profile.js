import React, { useState, useEffect } from "react";
import {
  fetchUserProfile,
  fetchUserPosts,
  deleteUserAccount,
  resetPassword,
} from "../api-helpers/helpers";
import CardLayout from "../Card-layout/cardLayout";
import "./Profile.css";
import Header from "../Header/header";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { authActions } from "../../store";
import EditProfileDetails from "../EditProfileDetails/editProfileDetails";
import ResetPassword from "../ResetPassword/resetPassword";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchUserDetails = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const userData = await fetchUserProfile(userId);
      setUser(userData.user);
      const userPosts = await fetchUserPosts(userId);
      setPosts(userPosts);
    } catch (err) {
      console.error("Error fetching user details or posts:", err);
      setError(
        err.response?.data?.message || "Failed to fetch user details or posts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [location.state?.refresh]);

  const handlePostDelete = async (postId) => {
    try {
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      await fetchUserDetails();
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post.");
    }
  };

  const handleDeleteProfile = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("User not authenticated");
        }
        await deleteUserAccount(userId);
        localStorage.removeItem("userId");
        dispatch(authActions.logout());
        navigate("/loginSignup");
      } catch (err) {
        console.error("Error deleting user profile:", err);
        setError("Failed to delete profile.");
      }
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setIsEditing(false);
    navigate(0); // Refresh the page to fetch the latest data
  };

  const handleResetPassword = async (oldPassword, newPassword) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }
      await resetPassword(userId, oldPassword, newPassword);
      alert("Password reset successful. Please log in with your new password.");
      localStorage.removeItem("userId");
      dispatch(authActions.logout());
      navigate("/loginSignup");
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    }
  };

  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return new Intl.DateTimeFormat("en-GB", options).format(
      new Date(dateString)
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header
        classNameheader="profile-header"
        classNamelogo="profile-logo"
        classNamenav="profile-nav"
        classNamesignin="profile-signin"
      />
      <div className="profile-container">
        <h1>My Profile</h1>
        {user ? (
          <div className="profile-details">
            <div className="profile-image">
              <img src={user.profileImage} alt="Profile" />
            </div>
            <div className="profile-info">
              <h2>{user.username}</h2>
              <h3
                style={{ color: "gray" }}
              >{`${user.firstName} ${user.lastName}`}</h3>
              <p>Email: {user.email}</p>
              <p>
                Bio: {user.bio || "Hi, I'm excited to share my travel diaries."}
              </p>
              <p>Joined: {formatDate(user.createdAt)}</p>
              <div className="profile-header-buttons">
                <button
                  onClick={() => setIsEditing(true)}
                  className="profile-edit-button"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="profile-delete-button"
                >
                  Delete Profile
                </button>
                <button
                  onClick={() => setIsResettingPassword(true)}
                  className="reset-password-button"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>No user data available</p>
        )}
        <div className="posts-section">
          <h2>Your Posts</h2>
          {posts.length > 0 ? (
            <CardLayout cardsData={posts} onDelete={handlePostDelete} />
          ) : (
            <p>No posts available</p>
          )}
        </div>
        {isEditing && (
          <EditProfileDetails
            user={user}
            onClose={() => setIsEditing(false)}
            onUpdate={handleProfileUpdate}
          />
        )}
        {isResettingPassword && (
          <ResetPassword
            onClose={() => setIsResettingPassword(false)}
            onResetPassword={handleResetPassword}
            loading={loading}
            error={error}
          />
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default Profile;
