import React, { useState, useEffect } from "react";
import { fetchUserProfile, fetchUserPosts } from "../api-helpers/helpers";
import CardLayout from "../Card-layout/cardLayout";
import "./UserProfile.css";
import Header from "../Header/header";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams(); // Get userId from URL parameters

  const fetchUserDetails = async () => {
    try {
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
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header
        classNameheader="user-profile-header"
        classNamelogo="user-profile-logo"
        classNamenav="user-profile-nav"
        classNamesignin="user-profile-signin"
      />
      <div className="user-profile-container">
        <h1>{`${user.username}'s Profile`}</h1>
        {user ? (
          <div className="user-profile-details">
            <div className="user-profile-image">
              <img src={user.profileImage} alt="Profile" />
            </div>
            <div className="user-profile-info">
              <h2>{user.username}</h2>
              <h3
                style={{ color: "gray" }}
              >{`${user.firstName} ${user.lastName}`}</h3>
              <p>Email: {user.email}</p>
              <p>Bio: {user.bio || "No bio available"}</p>
              <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <p>No user data available</p>
        )}
        <div className="user-posts-section">
          <h2>{user ? `${user.username}'s Posts` : "Posts"}</h2>
          {posts.length > 0 ? (
            <CardLayout cardsData={posts} />
          ) : (
            <p>No posts available</p>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    </>
  );
};

export default UserProfile;
