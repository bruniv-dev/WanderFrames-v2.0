import React, { useState, useRef } from "react";
import "./Upload.css";
import Header from "../Header/header";
import { addPost } from "../api-helpers/helpers";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    images: [],
    location: "",
    subLocation: "",
    description: "",
    date: "",
    locationUrl: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalImagesCount = formData.images.length + selectedFiles.length;

    if (totalImagesCount > 3) {
      alert("You can select up to 3 images.");
      e.target.value = "";
      return;
    }

    const compressedFiles = await Promise.all(
      selectedFiles.map((file) =>
        imageCompression(file, {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 800, // Maximum width or height
          useWebWorker: true, // Use web worker for performance
        })
      )
    );

    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...compressedFiles],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    formData.images.forEach((file) => {
      data.append("images", file);
    });
    data.append("location", formData.location);
    data.append("subLocation", formData.subLocation);
    data.append("description", formData.description);
    data.append("date", formData.date);
    data.append("user", localStorage.getItem("userId"));
    if (formData.locationUrl) {
      data.append("locationUrl", formData.locationUrl);
    }

    addPost(data)
      .then((response) => {
        console.log("Post added successfully:", response);
        navigate("/profile");
      })
      .catch((err) => console.error("Error adding post:", err));
  };

  return (
    <>
      <Header
        classNameheader="upload-header"
        classNamelogo="upload-logo"
        classNamenav="upload-nav"
        classNamesignin="upload-signin"
      />

      <div className="upload-container">
        <form
          className="upload-form"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="left-section">
            <label htmlFor="images">Images (up to 3):</label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              multiple
              ref={fileInputRef}
            />
            <label htmlFor="date" className="upload-label">
              Date
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="upload-input"
                required
                max={today}
              />
            </label>
            <label htmlFor="locationUrl" className="upload-label">
              Google Maps URL
              <input
                type="url"
                id="locationUrl"
                name="locationUrl"
                value={formData.locationUrl}
                onChange={handleInputChange}
                className="upload-input"
              />
            </label>
          </div>
          <div className="right-section">
            <label htmlFor="location" className="upload-label">
              Location
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="upload-input"
                required
              />
            </label>
            <label htmlFor="subLocation" className="upload-label">
              Sub-Location
              <input
                type="text"
                id="subLocation"
                name="subLocation"
                value={formData.subLocation}
                onChange={handleInputChange}
                className="upload-input"
                required
              />
            </label>
            <label htmlFor="description" className="upload-label">
              Description
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="upload-input"
                required
              />
            </label>
          </div>
          <button type="submit" className="submit-button">
            Add
          </button>
        </form>
      </div>
    </>
  );
};

export default Upload;
