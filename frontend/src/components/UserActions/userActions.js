import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  deleteUserById,
  updateUserIsAdmin,
} from "../api-helpers/helpers";
import UserCard from "../UserCard/userCard";
import "./UserActions.css";
import Header from "../Header/header";

const UserActions = () => {
  const [usersData, setUsersData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
    const storedUserId = localStorage.getItem("userId");
    setCurrentUserIsAdmin(storedIsAdmin);
    setLoggedInUserId(storedUserId);

    if (!storedIsAdmin) {
      navigate("/unauthorized");
    } else {
      getAllUsers()
        .then((data) => {
          const sortedUsers = data.users
            .sort((a, b) => b.isAdmin - a.isAdmin) // Sort admins first
            .sort((a, b) => (a._id === storedUserId ? -1 : 1)); // Move logged-in user to the top

          setUsersData(sortedUsers);
          setFilteredUsers(sortedUsers); // Initialize filteredUsers with sorted users
        })
        .catch((e) => console.log(e));
    }
  }, [navigate]);

  useEffect(() => {
    // Filter users based on the search query
    if (searchQuery) {
      setFilteredUsers(
        usersData.filter(
          (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (searchQuery.toLowerCase() === "admin" && user.isAdmin) ||
            (searchQuery.toLowerCase() === "user" && !user.isAdmin)
        )
      );
    } else {
      setFilteredUsers(usersData);
    }
  }, [searchQuery, usersData]);

  const handleAdminDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserById(userId)
        .then(() => {
          const updatedUsers = usersData.filter((user) => user._id !== userId);
          setUsersData(updatedUsers);
          setFilteredUsers(updatedUsers);
        })
        .catch((e) => console.log(e));
    }
  };

  const makeAdmin = (userId) => {
    if (window.confirm("Are you sure you want to make this user an admin?")) {
      updateUserIsAdmin(userId, true)
        .then((updatedUser) => {
          const updatedUsers = usersData
            .map((user) =>
              user._id === userId
                ? { ...user, isAdmin: updatedUser.isAdmin }
                : user
            )
            .sort((a, b) => b.isAdmin - a.isAdmin) // Sort admins first
            .sort((a, b) => (a._id === loggedInUserId ? -1 : 1)); // Move logged-in user to the top

          setUsersData(updatedUsers);
          setFilteredUsers(
            updatedUsers.filter(
              (user) =>
                user.username
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                user.firstName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                user.lastName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (searchQuery.toLowerCase() === "admin" && user.isAdmin) ||
                (searchQuery.toLowerCase() === "user" && !user.isAdmin)
            )
          );
        })
        .catch((e) => console.log(e));
    }
  };

  const removeAdmin = (userId) => {
    if (
      window.confirm(
        "Are you sure you want to remove admin privileges from this user?"
      )
    ) {
      updateUserIsAdmin(userId, false)
        .then((updatedUser) => {
          const updatedUsers = usersData
            .map((user) =>
              user._id === userId
                ? { ...user, isAdmin: updatedUser.isAdmin }
                : user
            )
            .sort((a, b) => b.isAdmin - a.isAdmin) // Sort admins first
            .sort((a, b) => (a._id === loggedInUserId ? -1 : 1)); // Move logged-in user to the top

          setUsersData(updatedUsers);
          setFilteredUsers(
            updatedUsers.filter(
              (user) =>
                user.username
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                user.firstName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                user.lastName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (searchQuery.toLowerCase() === "admin" && user.isAdmin) ||
                (searchQuery.toLowerCase() === "user" && !user.isAdmin)
            )
          );
        })
        .catch((e) => console.log(e));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <Header
        classNameheader="postActions-header"
        classNamelogo="postActions-logo"
        classNamenav="postActions-nav"
        classNamesignin="postActions-signin"
      />
      <div className="action-button">
        <input
          type="text"
          placeholder="Search by username, firstname, lastname, email, user ID, or 'admin'/'user'"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className="user-actions-container">
        {filteredUsers.map((user) => (
          <UserCard
            key={user._id}
            userId={user._id}
            username={user.username}
            firstName={user.firstName}
            lastName={user.lastName}
            createdAt={user.createdAt}
            email={user.email}
            bio={user.bio}
            profileImage={user.profileImage}
            isAdmin={user.isAdmin}
            onAdminDelete={handleAdminDelete}
            makeAdmin={makeAdmin}
            removeAdmin={removeAdmin}
            currentUserIsAdmin={currentUserIsAdmin}
          />
        ))}
      </div>
    </>
  );
};

export default UserActions;
