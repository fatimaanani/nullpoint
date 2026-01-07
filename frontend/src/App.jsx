import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

import RequireAuth from "./guards/requireAuth";
import RedirectIfAuth from "./guards/redirectIfAuth";

import BottomNav from "./components/BottomNav";

import Feed from "./pages/feed";
import CreatePost from "./pages/createPost";
import Journal from "./pages/journal";
import Profile from "./pages/profile";
import JournalLog from "./pages/journalLog";
import Splash from "./pages/splash";
import ThoughtsHistory from "./pages/thoughtsHistory";
import Authentication from "./pages/authentication";
import Login from "./pages/Login";

function AppContent() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

 const hideNav =
  location.pathname === "/authentication" ||
  location.pathname === "/login";


  return (
    <div className="app-container">
      <Routes>

        { }
        <Route
          path="/authentication"
          element={
            <RedirectIfAuth>
              <Authentication />
            </RedirectIfAuth>
          }
        />

        { }
        <Route
  path="/login"
  element={
    <RedirectIfAuth>
      <Login />
    </RedirectIfAuth>
  }
/>

        <Route
          path="/"
          element={<Navigate to="/feed" replace />}
        />

        { }
        <Route
          path="/feed"
          element={
            <RequireAuth>
              <Feed />
            </RequireAuth>
          }
        />

        <Route
          path="/create"
          element={
            <RequireAuth>
              <CreatePost />
            </RequireAuth>
          }
        />

        <Route
          path="/journal"
          element={
            <RequireAuth>
              <Journal />
            </RequireAuth>
          }
        />

        <Route
          path="/journal-log"
          element={
            <RequireAuth>
              <JournalLog />
            </RequireAuth>
          }
        />

        <Route path="/profile" element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
        />

        <Route
          path="/profile/thoughts"
          element={
            <RequireAuth><ThoughtsHistory /> </RequireAuth>} />

      </Routes>

      {!hideNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
