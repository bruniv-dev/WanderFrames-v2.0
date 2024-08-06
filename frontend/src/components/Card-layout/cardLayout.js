import React, { useState } from "react";
import Card from "../Card/card";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CardLayout.css";

const CardLayout = ({
  cardsData,
  onFavoriteToggle,
  onDelete,
  onAdminDelete,
}) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const openModal = (card) => {
    setSelectedCard(card);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  if (!cardsData || !Array.isArray(cardsData)) {
    return <div>No cards available.</div>;
  }

  console.log("Cards Data:", cardsData); // Debug log to check data structure

  // Slider settings for the modal
  const sliderSettings = {
    dots: true,
    infinite: selectedCard && selectedCard.images.length > 1, // Infinite only if there are multiple images
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: selectedCard && selectedCard.images.length > 1, // Autoplay only if there are multiple images
    autoplaySpeed: 3000, // Auto slide every 3 seconds
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

  return (
    <div className="card-layout">
      {cardsData.map((card) => (
        <Card
          key={card._id}
          _id={card._id}
          userId={card.user}
          images={card.images}
          location={card.location}
          subLocation={card.subLocation}
          description={card.description}
          date={card.date}
          locationUrl={card.locationUrl}
          onFavoriteToggle={onFavoriteToggle}
          onDelete={onDelete}
          onAdminDelete={onAdminDelete ? () => onAdminDelete(card._id) : null}
          onCardClick={() => openModal(card)}
        />
      ))}

      {selectedCard && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            {/* Image slider for the selected card */}
            <div className="modal-slider">
              <Slider {...sliderSettings}>
                {selectedCard.images.length > 0 ? (
                  selectedCard.images.map((img, index) => (
                    <img
                      key={index}
                      className="modal-slider-image"
                      src={img.url}
                      alt={`Slide ${index + 1}`}
                    />
                  ))
                ) : (
                  <img
                    className="modal-slider-image"
                    src="https://placehold.co/600x400"
                    alt="Placeholder"
                  />
                )}
              </Slider>
            </div>
            <h2>Card Details</h2>
            <p>Location: {selectedCard.location}</p>
            <p>Sub Location: {selectedCard.subLocation}</p>
            <p>Description: {selectedCard.description}</p>
            <p>Date: {formatDate(selectedCard.date)}</p>
            {/* Add more details as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardLayout;
