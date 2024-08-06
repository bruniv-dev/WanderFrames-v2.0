//COMPRESS
import React, { useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import imageCompression from "browser-image-compression";
import {
  updateUserProfile,
  checkUsernameAvailability,
} from "../api-helpers/helpers";
import "./EditProfileDetails.css";
import { useNavigate } from "react-router-dom";

const EditProfileDetails = ({ user, onClose, onUpdate }) => {
  const [username, setUserName] = useState(user.username);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [bio, setBio] = useState(
    user.bio || "Hi, I'm excited to share my travel diaries."
  );
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Preview of the selected image
  const [imageScale, setImageScale] = useState(1.2); // Scale state
  const [error, setError] = useState(null);
  const [usernameStatus, setUsernameStatus] = useState(""); // New state for username status
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();
  const editorRef = useRef(null); // Reference to AvatarEditor component

  useEffect(() => {
    const checkAvailability = async () => {
      if (username && username !== user.username) {
        try {
          const isAvailable = await checkUsernameAvailability(username);
          if (isAvailable) {
            setUsernameStatus("Username is available.");
          } else {
            setUsernameStatus("Username is already taken.");
          }
        } catch (err) {
          setUsernameStatus("Error checking username availability.");
        }
      } else {
        setUsernameStatus("");
      }
    };

    const debounce = setTimeout(checkAvailability, 300); // Debounce to avoid too many requests

    return () => clearTimeout(debounce); // Cleanup the timeout on unmount or when username changes
  }, [username, user.username]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const options = {
      maxSizeMB: 1, // Maximum size in MB
      maxWidthOrHeight: 1024, // Maximum width or height
    };
    try {
      const compressedFile = await imageCompression(file, options);
      setProfileImage(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Error compressing image:", error);
      setError("Failed to compress image.");
    }
  };

  const handleScaleChange = (e) => {
    setImageScale(parseFloat(e.target.value));
  };

  const getCroppedImage = () => {
    if (editorRef.current) {
      return new Promise((resolve) => {
        editorRef.current.getImageScaledToCanvas().toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg");
      });
    }
    return Promise.resolve(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the username is the same as the current one
    if (
      username !== user.username &&
      usernameStatus === "Username is already taken."
    ) {
      setError("Username already taken.");
      return;
    }

    setLoading(true); // Start loading state

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("bio", bio);

      // Handle profile image if present
      if (profileImage) {
        const editedImage = await getCroppedImage();
        if (editedImage) {
          formData.append("profileImage", editedImage, "profile-image.jpg");
        }
      }

      const response = await updateUserProfile(userId, formData);
      onUpdate(response.user);
      navigate("/profile", { state: { refresh: true } });
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError("Failed to update profile.");
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="edit-profile-modal">
      <div className="edit-profile-backdrop" onClick={onClose}></div>
      <div className="edit-profile-content">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              // Optionally add onBlur for additional checks
            />
            <p
              className={`username-status-message ${
                usernameStatus.includes("available") ? "available" : ""
              } ${
                usernameStatus.includes("taken") && username !== user.username
                  ? "taken"
                  : ""
              }`}
            >
              {usernameStatus}
            </p>
          </div>
          <div className="form-group">
            <div className="first-last">
              <div>
                <label htmlFor="firstName">First Name:</label>
                <input
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  id="firstName"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName">Last Name:</label>
                <input
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  id="lastName"
                  required
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a little about yourself..."
            />
          </div>
          <div className="form-group">
            <label>Profile Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className="avatar-editor-container">
                <AvatarEditor
                  ref={editorRef}
                  image={imagePreview}
                  width={250}
                  height={250}
                  border={50}
                  borderRadius={125}
                  color={[255, 255, 255, 0.6]} // RGBA
                  scale={imageScale} // Use the scale state
                  rotate={0}
                />
                <div className="scale-controls">
                  <label htmlFor="scale">Scale:</label>
                  <input
                    type="range"
                    id="scale"
                    min="1"
                    max="2"
                    step="0.01"
                    value={imageScale}
                    onChange={handleScaleChange}
                  />
                </div>
              </div>
            )}
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileDetails;
