import React, { useState, useEffect } from "react";
import { MdLocationOn, MdDeleteForever, MdEdit } from "react-icons/md";
import {
  toggleFavorite,
  fetchUserDetailsById,
  deletePostById,
} from "../api-helpers/helpers";
import Slider from "react-slick"; // Import the Slider component
import "slick-carousel/slick/slick.css"; // Import slick-carousel styles
import "slick-carousel/slick/slick-theme.css"; // Import slick-carousel theme styles
import "./Card.css";
import { useNavigate } from "react-router-dom";

const Card = ({
  images = [], // Change image to images array
  location,
  subLocation,
  description,
  date,
  _id,
  userId,
  locationUrl,
  onFavoriteToggle,
  onDelete,
  isAdmin,
  onAdminDelete,
  onCardClick,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility
  const [isExpanded, setIsExpanded] = useState(false); // State for showing full description
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setLoggedInUserId(storedUserId);

    // Use user-specific favorites key
    const favoritesKey = `favorites_${storedUserId}`;
    const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
    setIsFavorite(favorites.includes(_id));

    if (userId) {
      fetchUserDetailsById(userId)
        .then((user) => setUserDetails(user))
        .catch((err) => console.error("Error fetching user details:", err));
    }
  }, [_id, userId]);

  const updateFavoritesInLocalStorage = (newFavorites) => {
    const favoritesKey = `favorites_${loggedInUserId}`;
    localStorage.setItem(favoritesKey, JSON.stringify(newFavorites));
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (loggedInUserId) {
      if (_id) {
        toggleFavorite(_id)
          .then(() => {
            setIsFavorite((prevIsFavorite) => {
              const favoritesKey = `favorites_${loggedInUserId}`;
              const favorites =
                JSON.parse(localStorage.getItem(favoritesKey)) || [];
              const newFavorites = prevIsFavorite
                ? favorites.filter((favId) => favId !== _id)
                : [...favorites, _id];
              updateFavoritesInLocalStorage(newFavorites);
              if (onFavoriteToggle) {
                onFavoriteToggle();
              }
              return !prevIsFavorite;
            });
          })
          .catch((err) => console.log("Error in toggleFavorite:", err));
      } else {
        console.error("Post ID (_id) is missing");
      }
    } else {
      // Show popup if user is not logged in
      setShowPopup(true);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleLoginRedirect = () => {
    setShowPopup(false);
    navigate("/login"); // Redirect to login page or open login modal
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostById(_id)
        .then(() => {
          if (onDelete) {
            onDelete(_id);
          }
        })
        .catch((err) => console.error("Error deleting post:", err));
    }
  };

  const handleAdminDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this post?")) {
      if (onAdminDelete) {
        onAdminDelete(_id);
      }
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/editPost/${_id}`);
  };

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    navigate(`/userProfile/${userId}`);
  };

  const handleToggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to format date to "dd Month yyyy"
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

  // Remove duplicate images
  const uniqueImages = Array.from(new Set(images.map((img) => img.url))).map(
    (url) => images.find((img) => img.url === url)
  );

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: uniqueImages.length > 1, // Infinite only if there are more than 1 image
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: uniqueImages.length > 1, // Enable auto play if there are multiple images
    autoplaySpeed: 3000, // Auto slide every 3 seconds
  };

  return (
    <div className="card-container" onClick={onCardClick}>
      <div className="image-slider">
        {uniqueImages.length > 0 ? (
          <Slider {...sliderSettings}>
            {uniqueImages.map((img, index) => (
              <img
                key={index}
                className="slider-image"
                src={img.url}
                alt={`Slide ${index + 1}`}
              />
            ))}
          </Slider>
        ) : (
          <img
            className="slider-image"
            src="https://placehold.co/600x400"
            alt="Placeholder"
          />
        )}
      </div>
      <div className="card-header">
        <img
          className="profile-image-card"
          src={userDetails.profileImage}
          alt="profilepic"
        />
        <div className="user-info">
          <p className="username" onClick={handleUsernameClick}>
            {userDetails.username || "Unknown User"}
          </p>
          <p className="name">
            {`${userDetails.firstName} ${userDetails.lastName}` ||
              "Unknown User"}
          </p>
          <p className="date">{formatDate(date)}</p>
        </div>
        {locationUrl && (
          <a href={locationUrl} target="_blank" rel="noopener noreferrer">
            <MdLocationOn className="location-button" />
          </a>
        )}
        <button
          className={`add-to-favorites ${isFavorite ? "favorite" : ""}`}
          onClick={handleFavoriteClick}
        >
          {isFavorite ? "-" : "+"}
        </button>
        {(loggedInUserId === userId || isAdmin) && (
          <MdDeleteForever
            className="delete-button"
            onClick={handleDeleteClick}
          />
        )}
        {loggedInUserId === userId && (
          <MdEdit className="edit-button" onClick={handleEditClick} />
        )}
        {onAdminDelete && (
          <button className="delete-button" onClick={handleAdminDeleteClick}>
            Delete
          </button>
        )}
      </div>
      <div className="card-content">
        <p className="location">Location: {location}</p>
        <p className="sub-location">State, Country: {subLocation}</p>
        <p className={`description ${isExpanded ? "full-description" : ""}`}>
          {description}
        </p>
        <button className="read-more" onClick={handleToggleDescription}>
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </div>

      {/* Popup for users not logged in */}
      {showPopup && (
        <div className="popup-backdrop" onClick={handlePopupClose}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Please Sign In</h2>
            <p>You need to be logged in to add items to your favorites.</p>
            <button onClick={handleLoginRedirect}>Sign In</button>
            <button onClick={handlePopupClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
