// src/components/NavbarComponent.jsx
// Import the React library, necessary for creating React components.
import React from 'react';
// Import the Link component from 'react-router-dom' for client-side navigation.
import { Link } from 'react-router-dom';
// Import the CSS file specific to the Navbar for styling.
import '../CSS/Navbar.css';
// Import the logo image file to be used in the Navbar brand section.
import RecipeNestlogo from '../RecipeNestlogo.png';

// Define the functional component named NavbarComponent.
const NavbarComponent = () => {
  // Return the JSX structure that represents the Navbar UI.
  return (
    // Render a <nav> HTML element with Bootstrap classes for styling and responsiveness.
    // 'navbar': Base navbar class.
    // 'navbar-expand-lg': Collapse navbar for screens smaller than large.
    // 'navbar-dark': Use dark theme text/links.
    // 'bg-darkblue': Custom background color class (defined in CSS).
    <nav className="navbar navbar-expand-lg navbar-dark bg-darkblue">
      {/* Render a container div with Bootstrap class 'container-fluid' for full width. */}
      <div className="container-fluid">
        {/* Render a Link component acting as the Navbar brand, navigating to the homepage ('/'). */}
        <Link className="navbar-brand" to="/">
          {/* Render an <img> element for the logo image. */}
          <img
            // Set the source of the image to the imported logo file.
            src={RecipeNestlogo}
            // Provide alternative text for accessibility.
            alt="RecipeNest Logo"
            // Apply inline styles to set the height and right margin of the logo.
            style={{ height: '40px', marginRight: '10px' }}
          />
          {/* Render a <span> element to display the brand text next to the logo. */}
          <span className="logo-text">RECIPENEST</span>
        {/* Close the Link component for the navbar brand. */}
        </Link>
        {/* Render a button element acting as the toggler for collapsing the navbar on smaller screens (Bootstrap functionality). */}
        <button
          // Apply Bootstrap class 'navbar-toggler' for styling.
          className="navbar-toggler"
          // Set the button type.
          type="button"
          // Bootstrap attribute to target the collapsible content via its ID ('#navbarNav').
          data-bs-toggle="collapse"
          // Bootstrap attribute specifying the ID of the collapsible content.
          data-bs-target="#navbarNav"
          // ARIA attribute indicating the element controlled by the button.
          aria-controls="navbarNav"
          // ARIA attribute indicating the initial collapsed state (false means visible).
          aria-expanded="false"
          // ARIA attribute providing a label for screen readers.
          aria-label="Toggle navigation"
        >
          {/* Render a span element with Bootstrap class 'navbar-toggler-icon' to display the hamburger icon. */}
          <span className="navbar-toggler-icon" />
        {/* Close the toggler button element. */}
        </button>
        {/* Render a div element that contains the collapsible navbar content. */}
        {/* Bootstrap class 'collapse' makes it collapsible, 'navbar-collapse' provides styling. */}
        {/* ID 'navbarNav' links it to the toggler button. */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Render an unordered list (ul) for the main navigation links. */}
          {/* 'navbar-nav': Bootstrap class for navbar links. */}
          {/* 'ms-auto': Bootstrap class to push the items to the right (margin-start: auto). */}
          <ul className="navbar-nav ms-auto">
            {/* List item (li) for the 'Home' navigation link. */}
            <li className="nav-item">
              {/* Link component navigating to the home page ('/'). */}
              <Link className="nav-link" to="/">
                {/* Text content of the link. */}
                Home
              {/* Close the Home Link component. */}
              </Link>
            {/* Close the Home list item. */}
            </li>
            {/* List item (li) for the 'Chefs' navigation link. */}
            <li className="nav-item">
              {/* Link component navigating to the '/chefs' page. */}
              <Link className="nav-link" to="/chefs">
                {/* Text content of the link. */}
                Chefs
              {/* Close the Chefs Link component. */}
              </Link>
            {/* Close the Chefs list item. */}
            </li>
            {/* List item (li) for the 'Recipes' navigation link. */}
            <li className="nav-item">
              {/* Link component navigating to the '/recipes' page. */}
              <Link className="nav-link" to="/recipes">
                {/* Text content of the link. */}
                Recipes
              {/* Close the Recipes Link component. */}
              </Link>
            {/* Close the Recipes list item. */}
            </li>
            {/* List item (li) for the 'Gallery' navigation link. */}
            <li className="nav-item">
              {/* Link component navigating to the '/gallery' page. */}
              <Link className="nav-link" to="/gallery">
                {/* Text content of the link. */}
                Gallery
              {/* Close the Gallery Link component. */}
              </Link>
            {/* Close the Gallery list item. */}
            </li>
            {/* List item (li) for the 'About Us' navigation link. */}
            <li className="nav-item">
              {/* Link component navigating to the '/about' page. */}
              <Link className="nav-link" to="/about">
                {/* Text content of the link. */}
                About Us
              {/* Close the About Us Link component. */}
              </Link>
            {/* Close the About Us list item. */}
            </li>
          {/* Close the main navigation links list (ul). */}
          </ul>
          {/* Render another unordered list (ul) for authentication links (Signup/Login). */}
          {/* 'navbar-nav', 'ms-auto' for alignment, 'd-flex' likely for additional flex properties if needed. */}
          <ul className="navbar-nav ms-auto d-flex">
            {/* List item (li) for the 'Signup' link. */}
            <li className="nav-item">
              {/* Link component navigating to the '/signup' page. */}
              <Link className="nav-link" to="/signup">
                {/* Text content of the link. */}
                Signup
              {/* Close the Signup Link component. */}
              </Link>
            {/* Close the Signup list item. */}
            </li>
            {/* List item (li) for the 'Login' link. */}
            <li className="nav-item">
              {/* Link component navigating to the '/login' page. */}
              <Link className="nav-link" to="/login">
                {/* Text content of the link. */}
                Login
              {/* Close the Login Link component. */}
              </Link>
            {/* Close the Login list item. */}
            </li>
          {/* Close the authentication links list (ul). */}
          </ul>
        {/* Close the collapsible content div. */}
        </div>
      {/* Close the container-fluid div. */}
      </div>
    {/* Close the nav element. */}
    </nav>
  );
// Close the NavbarComponent functional component definition.
};

// Export the NavbarComponent as the default export of this module.
export default NavbarComponent;