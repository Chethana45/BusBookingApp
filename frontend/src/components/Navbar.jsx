import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/" onClick={handleLinkClick}>
            <span className="logo-icon">🚌</span>
            <span className="logo-text">BusBook</span>
          </Link>
        </div>

        {/* Hamburger Menu Icon */}
        <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>

        {/* Navigation Menu */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={handleLinkClick}>
              🏠 Home
            </Link>
            <Link to="/search-bus" className="nav-link" onClick={handleLinkClick}>
              🔍 Search Buses
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/booking-history" className="nav-link" onClick={handleLinkClick}>
                  📋 My Bookings
                </Link>
                <Link to="/profile" className="nav-link" onClick={handleLinkClick}>
                  👤 Profile
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="navbar-auth">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="nav-link login-btn"
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-link signup-btn"
                  onClick={handleLinkClick}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button className="nav-link logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
