import React from "react";
import { useNavigate } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import "./userCard.css";

const UserCard = ({
  userId,
  username,
  firstName,
  lastName,
  createdAt,
  email,
  bio,
  profileImage,
  isAdmin,
  onAdminDelete,
  makeAdmin,
  removeAdmin,
  currentUserIsAdmin,
  loggedInUserId,
}) => {
  const navigate = useNavigate();

  const handleUsernameClick = () => {
    navigate(`/userProfile/${userId}`);
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

  return (
    <div className="user-card-container">
      <img
        className="profile-picture"
        src={profileImage || "https://placehold.co/100x100"}
        alt="Profile"
      />
      <div className="user-card-content">
        <p className="userId">{userId}</p>
        <p
          className="username"
          onClick={handleUsernameClick}
          style={{ cursor: "pointer", color: "blue" }}
        >
          {username}
        </p>
        <p className="name">{`${firstName} ${lastName}`}</p>
        <p className="role" style={{ color: isAdmin ? "red" : "black" }}>
          Role: {isAdmin ? "Admin" : "User"}
        </p>
        <p className="joined">Joined: {formatDate(createdAt)}</p>
        <p className="email">Email: {email}</p>
        <p className="bio">{bio || "No bio available"}</p>
      </div>
      {loggedInUserId !== userId && (
        <>
          {currentUserIsAdmin && (
            <>
              {!isAdmin && (
                <button
                  className="make-admin-button"
                  onClick={() => makeAdmin(userId)}
                >
                  Make Admin
                </button>
              )}
              {isAdmin && (
                <button
                  className="remove-admin-button"
                  onClick={() => removeAdmin(userId)}
                >
                  Remove Admin
                </button>
              )}
              <button
                className="admin-delete-button"
                onClick={() => onAdminDelete(userId)}
              >
                <MdDeleteForever /> Delete
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserCard;
