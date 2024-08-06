import React, { useState } from "react";
import "./Home.css";
import Carousel from "../Carousel/Carousel.js";
import slides from "../data/caraouselData.json";
import Header from "../Header/header.js";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleShareJourneyClick = () => {
    const isLoggedIn = Boolean(localStorage.getItem("userId")); // Example check; replace with actual auth check
    if (isLoggedIn) {
      navigate("/upload");
    } else {
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleLoginRedirect = () => {
    handleClosePopup();
    navigate("/loginSignup");
  };

  return (
    <>
      <Header
        classNameheader=""
        classNamelogo=""
        classNamenav=""
        classNamesignin=""
      />
      <div className="home-container">
        <h1 className="heading">WANDER FRAMES</h1>
        <h4 className="sub-heading">
          From your lens to the world: let your adventures inspire.
        </h4>
        <Carousel data={slides.slides} />
        <div className="hero-buttons">
          <Link to="/inspirations" className="btn hero-button-1">
            Explore Inspirations
          </Link>
          <button
            onClick={handleShareJourneyClick}
            className="btn hero-button-2"
          >
            Share Your Journey
          </button>
        </div>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Please login first</h2>
              <button
                onClick={handleLoginRedirect}
                className="btn popup-button"
              >
                Go to Login
              </button>
              <button onClick={handleClosePopup} className="btn popup-button">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
