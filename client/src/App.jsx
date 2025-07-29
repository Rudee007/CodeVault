import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordReset from "./pages/PasswordReset";
import Dashboard from "./pages/Dashboard";
import SnippetView from "./pages/SnippetView";
import SnippetCreateEdit from "./pages/SnippetCreateEdit";
import UserProfile from "./pages/UserProfile";
import SharedSnippetView from "./pages/SharedSnippetView";
import NotFound from "./pages/NotFound";
import './index.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/password-reset" element={<PasswordReset />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/snippet/:id"
          element={
            <ProtectedRoute>
              <SnippetView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/snippet/:id/edit"
          element={
            <ProtectedRoute>
              <SnippetCreateEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/share/:shareId" element={<SharedSnippetView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
