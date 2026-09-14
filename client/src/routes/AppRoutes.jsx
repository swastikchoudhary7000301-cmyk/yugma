import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";

import Dashboard from "../pages/Dashboard";
import Profile from "../pages/profile";
import EditProfile from "../pages/editprofile";
import Connections from "../pages/connections";
import Chat from "../pages/chat";

import Explore from "../pages/Explore";
import Notifications from "../pages/Notifications";
import Saved from "../pages/Saved";
import Settings from "../pages/Settings";
import CreatePost from "../pages/CreatePost";
import Search from "../pages/Search";
import PostDetail from "../pages/PostDetail";

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* PROTECTED */}

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/profile/:id"
          element={<Profile />}
        />

        <Route
          path="/edit-profile"
          element={<EditProfile />}
        />

        <Route
          path="/connections"
          element={<Connections />}
        />

        <Route
          path="/chat"
          element={<Chat />}
        />

        <Route
          path="/explore"
          element={<Explore />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/saved"
          element={<Saved />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/create-post"
          element={<CreatePost />}
        />

        <Route
          path="/search"
          element={<Search />}
        />

        <Route
          path="/post/:id"
          element={<PostDetail />}
        />
      </Route>

      {/* FALLBACK */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;