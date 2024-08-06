import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home/home.js";
import Inspirations from "./components/Inspirations/inspirations.js";
import Profile from "./components/Profile/profile.js";
import Favorites from "./components/Favorites/favorites.js";
import Upload from "./components/Upload/upload.js";
import SignIn from "./components/SignIn/signIn.js";
import { useSelector } from "react-redux";
import EditPost from "./components/EditPost/editPost.js";
import ForgotPassword from "./components/ForgotPassword/forgotPassword.js";
import ResetPassword from "./components/ResetPassword/resetPassword.js";
import PostActions from "./components/PostActions/postActions.js";
import UserActions from "./components/UserActions/userActions.js";
import UserProfile from "./components/UserProfile/userProfile.js";
const App = () => {
  const isloggedIn = useSelector((state) => state.isloggedIn);
  console.log(isloggedIn);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/userProfile/:userId" element={<UserProfile />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/inspirations" element={<Inspirations />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/loginSignup" element={<SignIn />} />
        <Route path="/editPost/:postId" element={<EditPost />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/post-actions" element={<PostActions />} />
        <Route path="/user-actions" element={<UserActions />} />
      </Routes>
    </Router>
  );
};

export default App;
