import axios from "axios";

export const sendAuthRequest = async (signup, data) => {
  const endpoint = signup ? "/user/signup/" : "/user/login/";

  const payload = signup
    ? {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        securityQuestion: data.securityQuestion,
        securityAnswer: data.securityAnswer,
      }
    : {
        identifier: data.identifier,
        password: data.password,
      };

  try {
    const { status, data: responseData } = await axios.post(endpoint, payload);

    if (status === 200 || status === 201) {
      return responseData;
    }

    throw new Error(`Unexpected status code: ${status}`);
  } catch (error) {
    console.error(
      "Error during authentication:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post("/user/login/", credentials);
    const data = response.data;

    // Check if the token is present in the response
    if (data.token) {
      // Store the JWT token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId || ""); // Store userId if available
      localStorage.setItem("isAdmin", data.isAdmin?.toString() || "false"); // Store admin status if available
    }

    return data; // Return the data from the response
  } catch (error) {
    console.error("Error during authentication:", error);

    // Handle different types of errors
    if (error.response) {
      // Server responded with a status other than 2xx
      const errorMessage =
        error.response.data.message || "An error occurred. Please try again.";
      throw new Error(errorMessage);
    } else if (error.request) {
      // No response received from the server
      throw new Error("No response received from the server.");
    } else {
      // Other errors
      throw new Error("An unexpected error occurred.");
    }
  }
};


export const sendResetPasswordRequest = async (identifier) => {
  try {
    const response = await axios.post("/user/requestReset", { identifier });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(
        "Error requesting password reset:",
        error.response.data.message
      );
      throw new Error(error.response.data.message); // Throw custom error message for 404
    }
    console.error("Error requesting password reset:", error);
    throw new Error("Failed to request password reset"); // General error message for other errors
  }
};

export const verifySecurityAnswer = async (identifier, securityAnswer) => {
  const response = await axios.post("/user/verifySecurityAnswer", {
    identifier,
    securityAnswer,
  });
  return response.data;
};

export const checkUsernameAvailability = async (username) => {
  try {
    const response = await axios.get(`user/check-username/${username}`);
    return response.data.isAvailable;
  } catch (error) {
    console.error("Error checking username availability:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const res = await axios.get("/user");
    if (res.status !== 200) {
      console.log("Error Occurred");
    }
    const data = res.data;
    return data;
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    throw error;
  }
};

export const toggleFavorite = async (postId) => {
  const userId = localStorage.getItem("userId");
  if (!userId || !postId) {
    throw new Error("User ID or Post ID is missing");
  }

  try {
    const res = await axios.post("/user/toggleFavorite", { userId, postId });
    return res.data; // Data should include the updated favorites list
  } catch (error) {
    console.error("Error toggling favorite:", error.message);
    throw error;
  }
};

export const getAllPosts = async () => {
  try {
    const res = await axios.get("/post");
    if (res.status !== 200) {
      console.log("Error Occurred");
    }
    const data = res.data;
    return data;
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    throw error;
  }
};

// -------------------------------------------------------------------------------------------------------------------------

export const fetchUserDetailsById = async (userId) => {
  try {
    const response = await axios.get(`/user/${userId}`);
    return response.data; // Return the entire user object
  } catch (err) {
    console.error("Error fetching user details:", err);
    throw err;
  }
};

export const fetchPostById = async (postId) => {
  const res = await axios.get(`/post/${postId}`).catch((err) => {
    console.log(err);
  });
  if (res.status !== 200) {
    return console.log("Error fetching post data");
  }
  const resData = await res.data;
  return resData;
};

export const addPost = async (data) => {
  try {
    const response = await axios.post("/post/addPost", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Check if response status is 201 (Created)
    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error occurred while adding post:", error);
    throw new Error("Failed to add post. Please try again later.");
  }
};



// Fetch favorites for the logged-in user
export const fetchFavorites = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    throw new Error("User ID is missing");
  }

  try {
    const response = await axios.get(`/user/favorites/${userId}`);
    return response.data; // Data should include the favorites list
  } catch (err) {
    console.error("Error fetching favorites:", err);
    throw err;
  }
};

export const fetchUserProfile = async (userId) => {
  try {
    const response = await axios.get(`/user/profile/${userId}`);
    return response.data; // Ensure this matches the API response
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const fetchUserPosts = async (userId) => {
  try {
    const response = await axios.get(`/user/posts/${userId}`);
    return response.data.posts;
  } catch (err) {
    console.error("Error fetching user posts:", err);
    throw err;
  }
};

export const updatePost = async (id, data, imageFile = null) => {
  try {
    const response = await axios
      .put(`/post/${id}`, {
        image: data.image?.url || null,
        location: data.location,
        subLocation: data.subLocation,
        description: data.description,
        locationUrl: data.locationUrl || "",
        headers: {
          "Content-Type": "multipart/form-data", // Ensure the correct content type for FormData
        },
      })
      .catch((err) => console.log(err));

    if (response.status !== 200) {
      throw new Error("Failed to update the post");
    }

    const resData = await response.data;
    return resData;
  } catch (error) {
    console.error("Error updating post:", error.message);
    throw error;
  }
};

export const deletePostById = async (id) => {
  try {
    const response = await axios.delete(`/post/${id}`);
    return response.data; // Ensure this matches the API response structure
  } catch (error) {
    console.error("Error deleting post by ID:", error);
    throw error;
  }
};

export const deleteUserById = async (id) => {
  try {
    const response = await axios.delete(`/user/${id}`);
    return response.data; // Ensure this matches the API response structure
  } catch (error) {
    console.error("Error deleting post by ID:", error);
    throw error;
  }
};

// API call to delete user account
export const deleteUserAccount = async (userId) => {
  try {
    const response = await axios.delete(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user account:", error.message);
    throw error;
  }
};

export const updateUserProfile = async (userId, formData) => {
  try {
    const response = await axios.put(`/user/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error.response
      ? error.response.data
      : new Error("Error updating user profile");
  }
};

export const updateUserIsAdmin = async (userId, isAdmin) => {
  try {
    const response = await axios.put(`/user/${userId}/isAdmin`, {
      isAdmin,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};



export const resetPassword = async (userId, oldPassword, newPassword) => {
  const response = await axios.post(`/user/reset-password/${userId}`, {
    oldPassword,
    newPassword,
  });
  return response.data;
};


export const forgotPasswordReset = async (userId, newPassword) => {
  const response = await axios.post(`/user/forgot-password-reset/${userId}`, {
    newPassword,
  });
  return response.data;
};
