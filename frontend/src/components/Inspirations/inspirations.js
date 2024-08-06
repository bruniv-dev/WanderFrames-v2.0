import React, { useState, useEffect } from "react";
import Header from "../Header/header.js";
import "./Inspirations.css";
import CardLayout from "../Card-layout/cardLayout.js";
import { getAllPosts, fetchUserDetailsById } from "../api-helpers/helpers.js";

const Inspirations = () => {
  const [cardsData, setCardsData] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false); // Check if user is logged in

  useEffect(() => {
    getAllPosts()
      .then(async (data) => {
        const postsWithUserNames = await Promise.all(
          data.posts.map(async (post) => {
            try {
              const user = await fetchUserDetailsById(post.user);
              return {
                ...post,
                userName: user.username || "Unknown",
                lastName: user.lastName || "Unknown",
                firstName: user.firstName || "Unknown", // Set userName to "Unknown" if not available
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
  }, []);

  const handleSearch = (term) => {
    const lowercasedTerm = term.toLowerCase();
    const filtered = cardsData.filter((card) => {
      const userName = card.userName || ""; // Ensure userName exists
      const location = card.location || "";
      const subLocation = card.subLocation || "";
      const firstName = card.firstName || "";
      const lastName = card.lastName || "";
      return (
        userName.toLowerCase().includes(lowercasedTerm) ||
        firstName.toLowerCase().includes(lowercasedTerm) ||
        lastName.toLowerCase().includes(lowercasedTerm) ||
        location.toLowerCase().includes(lowercasedTerm) ||
        subLocation.toLowerCase().includes(lowercasedTerm)
      );
    });
    setFilteredCards(filtered);
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (!userLoggedIn) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSignIn = () => {
    // Redirect to sign-in page or open sign-in modal
    window.location.href = "/signin"; // Or use another method to handle sign-in
    setIsModalOpen(false);
  };

  return (
    <>
      <Header
        classNameheader="inspirations-header"
        classNamelogo="inspirations-logo"
        classNamenav="inspirations-nav"
        classNamesignin="inspirations-signin"
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
      <div className="inspirations-container">
        <CardLayout
          cardsData={filteredCards}
          onCardClick={handleCardClick} // Pass the card click handler
        />
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Please Sign In</h2>
            <p>You need to be signed in to add items to your favorites.</p>
            <button onClick={handleSignIn}>Sign In</button>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Inspirations;
