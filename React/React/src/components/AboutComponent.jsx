// Import React to use JSX and create the component
import React from "react";

// Import external CSS specific to this component for styling
import "./AboutComponent.css";

// Define the AboutComponent as a functional component
const AboutComponent = () => {
  return (
    // Main container for the About page content
    <div className="about-container">
      
      {/* Main heading for the About section */}
      <h1>About RecipeNest</h1>
      
      {/* First paragraph describing the purpose of RecipeNest */}
      <p>
        Welcome to <strong>RecipeNest</strong>, your go-to platform for discovering and sharing
        delightful recipes. Our mission is to bring together chefs and food lovers from around
        the world, creating a vibrant community of culinary creativity.
      </p>

      {/* Subheading for the story section */}
      <h2>Our Story</h2>
      
      {/* Paragraph describing the founding story of RecipeNest */}
      <p>
        Founded in <strong>2025</strong>, RecipeNest was born from a love for cooking and a
        vision to make cooking fun, easy, and accessible for everyone. We believe that every
        recipe tells a story, and we're here to help you share yours.
      </p>

      {/* Subheading for reasons to choose RecipeNest */}
      <h2>Why Choose RecipeNest?</h2>
      
      {/* Unordered list with key points highlighting RecipeNest features */}
      <ul className="about-list">
        
        {/* List item highlighting the variety of recipes */}
        <li>🍽️ <strong>Diverse Recipes:</strong> From classic favorites to unique new creations.</li>
        
        {/* List item highlighting chef insights available on the platform */}
        <li>⭐ <strong>Chef Insights:</strong> Learn tips & tricks from professional chefs.</li>
        
        {/* List item highlighting the easy-to-follow nature of recipes */}
        <li>📖 <strong>Easy to Follow:</strong> Step-by-step guides for perfect results.</li>
      </ul>

    </div> // End of about-container div
  );
};

// Export the AboutComponent to be used in other parts of the application
export default AboutComponent;
