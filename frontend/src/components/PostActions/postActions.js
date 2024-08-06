// export default PostActions;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/header.js";
import "./PostAction.css";
import CardLayout from "../Card-layout/cardLayout.js";
import {
  getAllPosts,
  deletePostById,
  fetchUserDetailsById,
} from "../api-helpers/helpers.js";

const PostActions = () => {
  const [cardsData, setCardsData] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    console.log(`isAdmin ${isAdmin}`);

    if (!isAdmin) {
      navigate("/unauthorized");
    } else {
      getAllPosts()
        .then(async (data) => {
          const postsWithUserNames = await Promise.all(
            data.posts.map(async (post) => {
              try {
                const user = await fetchUserDetailsById(post.user);
                return {
                  ...post,
                  userName: user.name || "Unknown", // Set userName to "Unknown" if not available
                };
              } catch {
                return {
                  ...post,
                  userName: "Unknown", // Default value on error
                };
              }
            })
          );
          setCardsData(postsWithUserNames);
          setFilteredCards(postsWithUserNames); // Set filtered data initially
        })
        .catch((e) => console.log(e));
    }
  }, [navigate]);

  const handleSearch = (term) => {
    const lowercasedTerm = term.toLowerCase();
    const filtered = cardsData.filter((card) => {
      const userName = card.userName || ""; // Ensure userName exists
      const location = card.location || "";
      const subLocation = card.subLocation || "";

      return (
        userName.toLowerCase().includes(lowercasedTerm) ||
        location.toLowerCase().includes(lowercasedTerm) ||
        subLocation.toLowerCase().includes(lowercasedTerm)
      );
    });
    setFilteredCards(filtered);
  };

  const handleAdminDelete = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostById(postId)
        .then(() => {
          setCardsData(cardsData.filter((post) => post._id !== postId));
          setFilteredCards(filteredCards.filter((post) => post._id !== postId));
        })
        .catch((e) => console.log(e));
    }
  };

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return isAdmin ? (
    <>
      <Header
        classNameheader="postActions-header"
        classNamelogo="postActions-logo"
        classNamenav="postActions-nav"
        classNamesignin="postActions-signin"
      />
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by username, location, or sublocation"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        <button onClick={() => handleSearch(searchTerm)}>Search</button>
      </div>
      <div className="postActions-container">
        <CardLayout
          cardsData={filteredCards}
          onAdminDelete={handleAdminDelete} // Pass the card click handler
        />
      </div>
    </>
  ) : null;
};

export default PostActions;
