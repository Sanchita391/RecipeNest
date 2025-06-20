// Import the React library and hooks (useState, useEffect) for component creation and state management.
import React, { useState, useEffect } from "react";
// Import the useNavigate hook from react-router-dom for programmatic navigation.
import { useNavigate } from "react-router-dom";
// Import the CSS file associated with this component for styling.
import "./Recipe.css"; // Make sure this CSS file exists

// Define the base URL constant for the backend API. Adjust if necessary.
const API_BASE_URL = "https://localhost:7092";

// Define a helper function to render star icons based on a numerical rating.
const renderStars = (rating) => {
  // Calculate the number of full stars (integer part of the rating).
  const fullStars = Math.floor(rating);
  // Determine if there should be a half star (currently simplified to show a full star if decimal part is >= 0.5).
  const halfStar = rating % 1 >= 0.5;
  // Calculate the number of empty stars needed to reach a total of 5.
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  // Initialize an empty string to build the star representation.
  let stars = '';
  // Append full star emojis (⭐) for each full star.
  for (let i = 0; i < fullStars; i++) stars += '⭐';
  // Append a star emoji if a half star is needed (currently simplified).
  if (halfStar) stars += '⭐'; // Simple rounding for now
  // Append empty star emojis (☆) for the remaining empty stars.
  for (let i = 0; i < emptyStars; i++) stars += '☆';
  // Return the generated string of stars, or a default of 5 empty stars if the rating was invalid/zero.
  return stars || '☆☆☆☆☆';
};


// Define the main functional component named RecipeCard.
const RecipeCard = () => {
  // Get the navigate function from react-router-dom for handling navigation actions.
  const navigate = useNavigate();
  // Declare a state variable 'searchTerm' to hold the value of the category search input.
  const [searchTerm, setSearchTerm] = useState("");
  // Declare a state variable 'fetchedRecipes' to store the array of recipes fetched from the API.
  const [fetchedRecipes, setFetchedRecipes] = useState([]);
  // Declare a state variable 'isLoading' to track whether recipes are currently being loaded.
  const [isLoading, setIsLoading] = useState(true);
  // Declare a state variable 'error' to store any error messages encountered during fetching.
  const [error, setError] = useState(null);

  // Use the useEffect hook to perform the side effect of fetching all recipes when the component mounts.
  useEffect(() => {
    // Define an asynchronous function to handle the fetching logic.
    const fetchAllRecipes = async () => {
      // Set loading state to true at the beginning of the fetch process.
      setIsLoading(true);
      // Clear any previous error messages.
      setError(null);
      // Log a message indicating the start of the fetch operation.
      console.log("Fetching all recipes from API...");

      // Comment indicating the start of the modification for handling authentication token.
      // *** MODIFICATION START ***
      // Retrieve the authentication token from local storage.
      const token = localStorage.getItem("token");
      // Initialize an empty object to hold request headers.
      const headers = {}; // Initialize headers object

      // Check if a token was found in local storage.
      if (token) {
        // If a token exists, add the 'Authorization' header with the Bearer token format.
        headers['Authorization'] = `Bearer ${token}`;
        // Log that the token was found and the header is being added.
        console.log("Token found, adding Authorization header.");
      // Handle the case where no token is found.
      } else {
        // Log a warning that the request is being made without authentication.
        console.warn("No token found. Requesting /api/recipes without authentication.");
        // Comment explaining potential actions if the endpoint strictly requires a token.
        // If the endpoint STRICTLY requires a token, we know it will fail here.
        // You might want to redirect to login or show a specific message immediately.
        // Example: setError("You must be logged in to view recipes.");
        // Example: setIsLoading(false);
        // Example: return; // Optional: Stop fetching if token is mandatory and missing
      }
      // Comment indicating the end of the authentication token handling modification.
      // *** MODIFICATION END ***

      // Start a try block to handle potential errors during the fetch operation.
      try {
        // Make an asynchronous fetch request to the recipes API endpoint, passing the constructed headers object.
        const res = await fetch(`${API_BASE_URL}/api/recipes`, { headers }); // <-- Pass headers here

        // Check if the response status code indicates failure (not OK).
        if (!res.ok) {
            // Provide more specific feedback for 401 Unauthorized errors.
            if (res.status === 401) {
                // Throw an error specific to authentication requirement.
                throw new Error(`Authentication required (401). Please log in.`);
            // Provide specific feedback for 403 Forbidden errors.
            } else if (res.status === 403) {
                 // Throw an error specific to permission issues.
                 throw new Error(`You do not have permission to view this (403).`);
            }
            // For other non-OK statuses, throw a generic HTTP error with the status code.
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        // If the response is OK, parse the JSON response body.
        const data = await res.json();
        // Log the received API response data for debugging.
        console.log("API Response:", data);

        // Check if the received data is an array, as expected for a list of recipes.
        if (Array.isArray(data)) {
           // If it's an array, update the 'fetchedRecipes' state with the data.
           setFetchedRecipes(data);
        // If the data is not an array.
        } else {
           // Log an error indicating the unexpected data format.
           console.error("API did not return an array:", data);
           // Set the recipes state to an empty array.
           setFetchedRecipes([]);
           // Set an error message indicating invalid data format.
           setError("Failed to load recipes: Invalid data format.");
        }

      // Catch any errors that occurred during the try block (network errors, thrown errors, parsing errors).
      } catch (err) {
        // Log the detailed error object to the console.
        console.error("Failed to fetch recipes:", err);
        // Set the 'error' state with the specific error message caught (including custom 401/403 messages) or a generic fallback message.
        setError(err.message || "An error occurred while fetching recipes.");
        // Set the recipes state to an empty array in case of an error.
        setFetchedRecipes([]);
      // The 'finally' block executes regardless of whether the try/catch block succeeded or failed.
      } finally {
        // Set the loading state back to false, indicating the fetch attempt is complete.
        setIsLoading(false);
      }
    };

    // Call the fetchAllRecipes function defined above to initiate the data fetching.
    fetchAllRecipes();
  // The empty dependency array [] ensures this useEffect hook runs only once when the component mounts.
  }, []); // Empty dependency array runs only once on mount

  // Comment indicating the start of the navigation handlers section.
  // --- Navigation Handlers ---
  // Define a function to handle navigation to the recipe detail page when a "Read More" or "View Recipe" button is clicked.
  const handleReadMore = (recipeId) => {
    // Use the navigate function to go to the specific recipe's detail route.
    navigate(`/recipe/${recipeId}`);
    // Log the navigation action for debugging.
    console.log(`Navigate to details for recipe ID: ${recipeId}`);
  };

  // Define a function to handle the search input, specifically when the Enter key is pressed.
  const handleSearch = (e) => {
    // Check if the key pressed was "Enter".
    if (e.key === "Enter") {
      // Get the search term from state, convert to lowercase, and remove leading/trailing whitespace.
      const input = searchTerm.toLowerCase().trim();
      // Check if the input matches variations of "fastfood".
      if (input === "fastfood" || input === "fast food") navigate("/fastfood");
      // Check if the input matches variations of "dessert".
      else if (input === "dessert" || input === "desserts") navigate("/dessert");
      // Check if the input matches variations of "main dish".
      else if (input === "main dish" || input === "maindish" || input === "main dishes") navigate("/maindishes");
      // If no category match is found, show an alert message.
      else alert("Category navigation not found. Try: fastfood, dessert, or main dish.");
      // Clear the search input field after attempting navigation or showing the alert.
      setSearchTerm("");
    }
  };

  // Return the JSX structure for the RecipeCard component's UI.
  return (
    // Main container div for the entire recipe listing section.
    <div className="recipe-container">
      {/* Container div for the category search bar. */}
      <div className="search-bar">
        {/* Label for the search input field. */}
        <label>Search Category:</label>
        {/* Input field for entering the category search term. */}
        <input
          // Set the input type to text.
          type="text"
          // Placeholder text displayed when the input is empty.
          placeholder="Enter category (fastfood, dessert, main dish) and press Enter"
          // Bind the input's value to the 'searchTerm' state variable.
          value={searchTerm}
          // Update the 'searchTerm' state whenever the input value changes.
          onChange={(e) => setSearchTerm(e.target.value)}
          // Attach the handleSearch function to the onKeyDown event to detect Enter key presses.
          onKeyDown={handleSearch}
        />
      {/* Close the search-bar div. */}
      </div>

      {/* Comment indicating the conditional rendering for loading/error messages. */}
      {/* Display Loading or Error Message */}
      {/* Conditional rendering: Display a loading message if 'isLoading' state is true. */}
      {isLoading && <p className="loading-message">Loading recipes...</p>}
      {/* Conditional rendering: Display the specific error message if 'error' state is not null. */}
      {error && <p className="error-message">Error: {error}</p>}


      {/* Comment indicating the conditional rendering for the recipe grid. */}
      {/* Display Recipe Grid if not loading and no error */}
      {/* Conditional rendering: Display the recipe grid only if not loading AND no error occurred. */}
      {!isLoading && !error && (
        // Container div for the grid layout of recipe cards.
        <div className="recipe-grid">
          {/* Conditional rendering inside the grid: Check if there are recipes to display. */}
          {fetchedRecipes.length > 0 ? (
             // If recipes exist, map over the 'fetchedRecipes' array to render a card for each recipe.
             fetchedRecipes.map((recipe) => (
              // Container div for a single recipe card. Use the unique recipe ID as the key.
              <div key={recipe.id} className="recipe-card">
                {/* Container div specifically for the recipe card's image. */}
                <div className="card-img-container">
                  {/* Image element for the recipe. */}
                  <img
                    // Apply CSS class for styling.
                    className="card-img-top"
                    // Set the image source URL. Handle cases where the URL might be relative to the API base URL.
                    src={recipe.imageUrl?.startsWith('/') ? `${API_BASE_URL}${recipe.imageUrl}` : recipe.imageUrl}
                    // Set the alternative text for accessibility, using the recipe title or a default.
                    alt={recipe.title || 'Recipe image'}
                    // Add an onError handler to display a default image if the primary image fails to load.
                    onError={(e) => { e.target.src = '/images/default-food.png'; }}
                  />
                {/* Close the image container div. */}
                </div>
                {/* Container div for the textual content and actions within the recipe card. */}
                <div className="card-body">
                  {/* Heading element displaying the recipe title or a default if missing. */}
                  <h3 className="card-title">{recipe.title || 'Untitled Recipe'}</h3>
                  {/* Paragraph element containing meta-information like type and cuisine. */}
                  <p className="recipe-meta">
                    {/* Conditionally render the Type if it exists. Use React Fragment <> for grouping. */}
                    {recipe.type && <><strong>Type:</strong> {recipe.type} <br /></>}
                    {/* Conditionally render the Cuisine if it exists. */}
                    {recipe.cuisine && <><strong>Cuisine:</strong> {recipe.cuisine}</>}
                  {/* Close the recipe-meta paragraph. */}
                  </p>
                  {/* Conditional rendering for the average rating: Check if it's a valid number. */}
                  {typeof recipe.averageRating === 'number' && (
                     // Container div for the rating display.
                     <div className="rating">
                         {/* Span to display the star icons generated by the renderStars helper function. */}
                         <span className="stars">{renderStars(recipe.averageRating)}</span>
                         {/* Span to display the numerical rating value, formatted to one decimal place. */}
                         <span className="rating-value"> ({recipe.averageRating.toFixed(1)}/5)</span>
                      {/* Close the rating div. */}
                      </div>
                  )}
                  {/* Conditional rendering: Display "No ratings yet" if averageRating is not a number. */}
                   {typeof recipe.averageRating !== 'number' && ( <div className="rating no-rating">No ratings yet</div> )}
                  {/* Paragraph element displaying the recipe description or a default if missing. */}
                  <p className="description"> {recipe.description || 'No description available.'} </p>
                  {/* Button to navigate to the detailed view of the recipe. */}
                  <button className="read-more" onClick={() => handleReadMore(recipe.id)}> View Recipe </button>
                {/* Close the card-body div. */}
                </div>
              {/* Close the recipe-card div. */}
              </div>
            ))
          // If fetchedRecipes array is empty (and there was no loading error).
          ) : (
            // Comment explaining this condition.
            // Show only if there was no loading error but the array is empty
            // Display a message indicating that no recipes were found.
             !error && <p className="info-message">No recipes found.</p>
          )}
        {/* Close the recipe-grid div. */}
        </div>
      )}
    {/* Close the main recipe-container div. */}
    </div>
  );
// Close the RecipeCard functional component definition.
};

// Export the RecipeCard component as the default export of this module.
export default RecipeCard;