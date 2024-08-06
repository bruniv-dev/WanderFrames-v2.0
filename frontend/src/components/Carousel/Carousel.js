import React, { useState, useEffect, useRef } from "react";
import "./Carousel.css";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const Carousel = ({ data }) => {
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoRunRef = useRef(null);

  const nextSlide = () => {
    setSlide((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setSlide((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };

  const pauseAutoRun = () => {
    setIsPaused(true);
    if (autoRunRef.current) {
      clearInterval(autoRunRef.current);
    }
  };

  const resumeAutoRun = () => {
    setIsPaused(false);
  };

  useEffect(() => {
    if (!isPaused) {
      autoRunRef.current = setInterval(nextSlide, 3000);
    }
    return () => clearInterval(autoRunRef.current);
  });

  useEffect(() => {
    if (isPaused) {
      const pauseTimeout = setTimeout(resumeAutoRun, 3000);
      return () => clearTimeout(pauseTimeout);
    }
  }, [isPaused]);

  return (
    <div className="carousel">
      <FaAngleLeft
        className="arrow left-arrow"
        onClick={() => {
          prevSlide();
          pauseAutoRun();
        }}
        onMouseEnter={pauseAutoRun}
        onMouseLeave={resumeAutoRun}
      />
      {data.map((item, id) => (
        <img
          src={item.src}
          alt={item.alt}
          key={id}
          className={slide === id ? "slide" : "slide slide-hidden"}
        />
      ))}
      <FaAngleRight
        className="arrow right-arrow"
        onClick={() => {
          nextSlide();
          pauseAutoRun();
        }}
        onMouseEnter={pauseAutoRun}
        onMouseLeave={resumeAutoRun}
      />
      <span className="slider-buttons">
        {data.map((_, id) => (
          <button
            className={
              slide === id ? "slider-button" : "slider-button-inactive"
            }
            key={id}
            onClick={() => {
              setSlide(id);
              pauseAutoRun();
            }}
            onMouseEnter={pauseAutoRun}
            onMouseLeave={resumeAutoRun}
          ></button>
        ))}
      </span>
    </div>
  );
};

export default Carousel;
