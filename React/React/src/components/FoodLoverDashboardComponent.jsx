// Import React library and necessary hooks: useEffect, useState, useCallback.
import React, { useEffect, useState, useCallback } from "react";
// Import hooks from react-router-dom for navigation and linking.
import { useNavigate, Link } from "react-router-dom";
// JSX comment indicating the need for Font Awesome for social icons.
// Make sure Font Awesome is linked in your index.html or via CSS import

// Import CSS files for component styling. Ensure paths are correct.
import "./FoodLoverDashboardComponent.css"; // Styles for dashboard layout, navbar, forms, recipes view
import "./Home.css"; // Styles needed for Hero, Community, Reviews, Footer sections included in Home view

// Define the base URL constant for the backend API.
const API_BASE_URL = "https://localhost:7092"; // Make sure this matches your API

// JSX comment indicating where helper components are defined or should be imported.
// --- Helper Components (Ensure these are defined or imported) ---
// Define a reusable StarRatingInput component for selecting a star rating.
const StarRatingInput = ({ rating, setRating }) => {
    // State to track the star being hovered over for interactive highlighting.
    const [hoverRating, setHoverRating] = useState(0);
    // Return the JSX for the star rating input.
    return (
        // Container div for the star rating input.
        <div className="star-rating-input">
            {/* Map over an array representing 5 stars. */}
            {[1, 2, 3, 4, 5].map((star) => (
                // Render each star as a span element.
                <span
                    // Unique key for each star in the list.
                    key={star}
                    // Dynamically apply 'filled' class based on hover or actual rating.
                    className={`star ${(hoverRating || rating) >= star ? 'filled' : ''}`}
                    // Set the actual rating when a star is clicked.
                    onClick={() => setRating(star)}
                    // Update hover state when mouse enters a star.
                    onMouseEnter={() => setHoverRating(star)}
                    // Reset hover state when mouse leaves a star.
                    onMouseLeave={() => setHoverRating(0)}
                    // Make the star interactive for accessibility.
                    role="button"
                    // Allow focus for keyboard navigation.
                    tabIndex="0"
                    // Allow setting rating with Enter or Space key for accessibility.
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRating(star)}
                    // ARIA label for screen readers.
                    aria-label={`Rate ${star} out of 5 stars`}
                >
                    {/* Unicode star character. */}
                    ★
                </span>
            ))}
        </div>
    );
};
// Define a reusable function to render stars for display purposes (not input).
const renderStarsDisplay = (rating) => {
    // Initialize an empty array to hold the star elements.
    const stars = [];
    // Loop 5 times to create 5 stars.
    for (let i = 1; i <= 5; i++) {
        // Push a span element for each star, conditionally adding the 'filled' class.
        stars.push(<span key={i} className={i <= rating ? "star filled" : "star"}>★</span>);
    }
    // Return a div containing the rendered stars for display.
    return <div className="star-rating-display">{stars}</div>;
};

// JSX comment indicating the start of the main dashboard component.
// --- Main Dashboard Component ---
// Define the main functional component for the Food Lover Dashboard.
const FoodLoverDashboardComponent = () => {
  // JSX comment indicating the state section.
  // --- State ---
  // Get the navigate function from react-router-dom for programmatic navigation.
  const navigate = useNavigate();
  // Retrieve the authentication token from local storage.
  const token = localStorage.getItem("token");
  // State to track the currently active view/section in the dashboard (e.g., 'home', 'recipes').
  const [activeView, setActiveView] = useState("home");
  // State to store the details of the logged-in food lover user.
  const [foodLoverDetails, setFoodLoverDetails] = useState({});
  // State to manage the form data for the user profile update form.
  const [formData, setFormData] = useState({ name: "", email: "", password: "", roleTitle: "", specialty: "" });
  // State to store the list of all fetched recipes.
  const [recipes, setRecipes] = useState([]);
  // State to store the recipes currently displayed (potentially filtered).
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  // State to track the active category tab in the recipes view.
  const [activeRecipeTab, setActiveRecipeTab] = useState("All");
  // State to store the user's ratings for individual recipes (before submission). Key is recipeId.
  const [ratings, setRatings] = useState({});
  // JSX comment indicating re-added state for platform review functionality.
  // <<< Re-added state for Platform Review Form & Display >>>
  // State to store the text entered in the platform review form.
  const [reviewText, setReviewText] = useState("");
  // State to store the star rating selected in the platform review form.
  const [ratingValue, setRatingValue] = useState(0); // Rating for platform review
  // State to track if the platform review is currently being submitted.
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  // State to store feedback messages (success/error) after submitting the review.
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  // State to store the list of approved platform reviews fetched from the API.
  const [approvedReviews, setApprovedReviews] = useState([]); // For displaying existing reviews
  // State to track if the approved reviews are currently being loaded.
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  // JSX comment indicating the end of the re-added state section.
  // --- End Re-added state ---
  // State to track the overall loading status of the dashboard (initial data fetch).
  const [isLoading, setIsLoading] = useState(true); // Overall loading state
  // State to store any general error messages encountered during API calls or processing.
  const [error, setError] = useState(null);

  // JSX comment indicating the handlers and callbacks section.
  // --- Handlers & Callbacks ---
  // Define a memoized callback function to handle user logout.
  const handleLogout = useCallback(() => {
    // Confirm with the user before logging out.
    if (window.confirm("Are you sure you want to log out?")) {
      // Clear all items from local storage (including the token).
      localStorage.clear();
      // Navigate the user to the login page.
      navigate("/login");
    }
  // Dependency array includes navigate to ensure it uses the latest instance.
  }, [navigate]);
  // Define a function to handle clicks on navigation items, switching the active view.
  const handleNavClick = (view) => {
    // Log the view being switched to for debugging.
    console.log("Switching view to:", view);
    // Clear any previous general error messages.
    setError(null);
    // Update the activeView state to the newly selected view.
    setActiveView(view);
  };
  // Define a memoized async callback function to fetch the current user's details.
  const fetchUserDetails = useCallback(async () => {
    // If no token exists, trigger logout and reject the promise.
    if (!token) { handleLogout(); return Promise.reject("No token"); }
    // Log the start of the fetch operation.
    console.log("Fetching User details...");
    // Start a try block for error handling during the fetch.
    try {
      // Make a GET request to the '/api/Users/me' endpoint.
      const res = await fetch(`${API_BASE_URL}/api/Users/me`, {
        // Include the Authorization header with the bearer token.
        headers: { Authorization: `Bearer ${token}` }
      });
      // Check if the response status is not OK.
      if (!res.ok) {
        // If unauthorized (401), throw a specific error.
        if (res.status === 401) throw new Error("Unauthorized");
        // Otherwise, throw a generic error with the status code.
        throw new Error(`Failed to fetch profile (Status: ${res.status})`);
      }
      // Parse the JSON response body.
      const data = await res.json();
      // Update the foodLoverDetails state with the fetched data.
      setFoodLoverDetails(data);
      // Pre-populate the profile update form state with fetched data.
      setFormData({ name: data.name || "", email: data.email || "", password: "", roleTitle: data.roleTitle || "", specialty: data.specialty || "" });
      // Return the fetched data.
      return data;
    // Catch any errors during the fetch process.
    } catch (err) {
      // Log the error for debugging.
      console.error("Error fetchUserDetails:", err);
      // Set the error state, providing a user-friendly message.
      setError(err.message === "Unauthorized" ? "Session expired. Please log in again." : "Could not fetch profile details.");
      // If the error was 'Unauthorized', trigger the logout process.
      if (err.message === "Unauthorized") handleLogout();
      // Re-throw the error to be caught by Promise.allSettled.
      throw err;
    }
  // Dependencies: token and handleLogout function.
  }, [token, handleLogout]);
  // Define a memoized async callback function to fetch all recipes.
  const fetchAllRecipes = useCallback(async () => {
    // If no token exists, trigger logout and reject the promise.
    if (!token) { handleLogout(); return Promise.reject("No token"); }
    // Log the start of the fetch operation.
    console.log("Fetching all recipes...");
    // Start a try block for error handling.
    try {
      // Make a GET request to the '/api/recipes' endpoint.
      const res = await fetch(`${API_BASE_URL}/api/recipes`, {
        // Include the Authorization header.
        headers: { Authorization: `Bearer ${token}` }
      });
      // Check if the response status is not OK.
      if (!res.ok) {
        // Handle unauthorized error specifically.
        if (res.status === 401) throw new Error("Unauthorized");
        // Throw a generic error for other non-OK statuses.
        throw new Error(`Failed to fetch recipes (Status: ${res.status})`);
      }
      // Parse the JSON response.
      const data = await res.json();
      // Check if the received data is an array as expected.
      if (Array.isArray(data)) {
        // Update the recipes state with the fetched data.
        setRecipes(data);
        // Initialize the filtered recipes state with all recipes.
        setFilteredRecipes(data);
        // Set the active recipe tab back to 'All'.
        setActiveRecipeTab("All");
        // Log the number of recipes fetched.
        console.log(`Fetched ${data.length} recipes.`);
        // Return the fetched data.
        return data;
      } else {
        // If data is not an array, throw an error indicating invalid format.
        throw new Error("Invalid recipe data format.");
      }
    // Catch any errors during the fetch.
    } catch (err) {
      // Log the error.
      console.error("Error fetching recipes:", err);
      // Set the error state, avoiding overwriting existing errors unless it's an Unauthorized error.
      if (!error || err.message === "Unauthorized") {
        setError(err.message === "Unauthorized" ? "Session expired. Please log in again." : "Could not fetch recipes.");
      }
      // Reset recipes states to empty arrays on error.
      setRecipes([]);
      setFilteredRecipes([]);
      // If unauthorized, trigger logout.
      if (err.message === "Unauthorized") handleLogout();
      // Re-throw the error.
      throw err;
    }
  // Dependencies: token, the current error state, and handleLogout.
  }, [token, error, handleLogout]);
  // JSX comment indicating the re-added fetchApprovedReviews function.
  // <<< Re-added fetchApprovedReviews >>>
  // Define a memoized async callback function to fetch approved public reviews.
  const fetchApprovedReviews = useCallback(async () => {
    // Set loading state for reviews to true.
    setIsLoadingReviews(true);
    // Log the start of the fetch operation.
    console.log("Fetching approved public reviews...");
    // Start a try block for error handling.
    try {
      // Make a GET request to the public reviews endpoint.
      const res = await fetch(`${API_BASE_URL}/api/PublicReviews`); /* Uses the public endpoint */
      // Check if the response status is not OK.
      if (!res.ok) throw new Error(`HTTP error fetching approved reviews! (Status: ${res.status})`);
      // Parse the JSON response.
      const data = await res.json();
      // Update the approvedReviews state, ensuring it's always an array.
      setApprovedReviews(Array.isArray(data) ? data : []);
      // Return the fetched data.
      return data;
    // Catch any errors during the fetch.
    } catch (error) {
      // Log the error.
      console.error("Failed to fetch approved reviews:", error);
      // Reset approvedReviews state to empty array on error.
      setApprovedReviews([]); /* Set specific review error? setError(...) might overwrite */
    // Finally block ensures this runs whether the try block succeeded or failed.
    } finally {
      // Set loading state for reviews to false.
      setIsLoadingReviews(false);
    }
  // Empty dependency array means this callback is created once and doesn't depend on props or state.
  }, []);

  // JSX comment indicating the initial data fetch useEffect hook.
  // <<< Re-added Initial Data Fetch including approved reviews >>>
  // useEffect hook to fetch initial data when the component mounts or token changes.
  useEffect(() => {
    // If no token is found, redirect to login immediately.
    if (!token) { navigate("/login"); return; }
    // Set the overall loading state to true.
    setIsLoading(true);
    // Clear any previous errors.
    setError(null);
    // Log the start of the initial data fetch process.
    console.log("Dashboard mounting: fetching initial data...");
    // Use Promise.allSettled to run multiple fetch operations concurrently.
    Promise.allSettled([ // Use Settled to proceed even if one fails
        // Fetch user details.
        fetchUserDetails(),
        // Fetch all recipes.
        fetchAllRecipes(),
        // Fetch approved public reviews. <<< Fetch approved reviews on load
        fetchApprovedReviews()
    // This '.then' block executes after all promises have settled (either resolved or rejected).
    ]).then((results) => {
       // Log completion of the fetch attempt.
       console.log("Initial data fetch attempt complete.");
        // Iterate over the results of the promises.
        results.forEach((result, index) => {
             // If a promise was rejected, log the reason.
             if (result.status === 'rejected') {
                  console.error(`Initial fetch failed (Promise ${index}):`, result.reason);
             }
        });
       // JSX comment explaining error handling strategy.
       // Errors for specific sections (profile, recipes, reviews) are set within their respective fetch functions
       // Set overall isLoading false after all attempts finish
    // The '.finally' block executes after the '.then' block, regardless of success or failure.
    }).finally(() => {
        // Set the overall loading state to false, indicating data fetch is complete.
        setIsLoading(false);
    });
  // Dependency array: effect runs if token, navigate, or fetch function references change. <<<< Added fetchApprovedReviews
  }, [token, navigate, fetchUserDetails, fetchAllRecipes, fetchApprovedReviews]);

  // Define a handler for input changes in forms (e.g., profile update form).
  const handleInputChange = (e) => {
    // Destructure name and value from the event target (the input element).
    const { name, value } = e.target;
    // Update the formData state using the previous state.
    setFormData((prev) => ({
        // Spread the previous state.
        ...prev,
        // Update the specific field that changed using computed property names.
        [name]: value
    }));
  };
  // Define an async function to handle the profile update form submission.
  const updateProfile = async (e) => { /* ... (same as before) ... */
    // Prevent the default form submission behavior (page reload).
    e.preventDefault();
    // If no token, trigger logout.
    if (!token) { handleLogout(); return; }
    // Clear previous errors.
    setError(null);
    // Set loading state to true.
    setIsLoading(true);
    // Construct the data object to send, conditionally including the password only if it's entered.
    const updateData = { name: formData.name, email: formData.email, ...(formData.password && { password: formData.password }), roleTitle: formData.roleTitle, specialty: formData.specialty };
    // Start a try block for the API call.
    try {
      // Make a PUT request to update the user profile.
      const res = await fetch(`${API_BASE_URL}/api/Users/me`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(updateData) });
      // If the update was successful (status OK).
      if (res.ok) {
        // Show a success message.
        alert("Profile updated successfully!");
        // Re-fetch user details to update the UI.
        await fetchUserDetails();
        // Navigate back to the home view after successful update.
        handleNavClick('home');
      // If the update failed.
      } else {
        // Prepare a default error message.
        let errorMsg = `Update failed (Status: ${res.status})`;
        // Try to parse a more specific error message from the response body.
        try { errorMsg = (await res.json()).message || errorMsg; } catch {}
        // Set the error state with the detailed message.
        setError(`Profile update failed: ${errorMsg}`);
        // Show an alert with the error message.
        alert(`Profile update failed: ${errorMsg}`);
        // If unauthorized, trigger logout.
        if (res.status === 401) handleLogout();
      }
    // Catch network or other errors during the fetch.
    } catch (err) {
      // Set a generic network error message.
      setError("A network error occurred.");
      // Show a generic network error alert.
      alert("A network error occurred.");
    // Finally block to run after try/catch.
    } finally {
      // Set loading state back to false.
      setIsLoading(false);
    }
  };
  // Define a function to filter recipes based on the selected category type.
  const filterRecipesByCategory = (type) => { /* ... (same as before) ... */
    // Log the type being filtered by.
    console.log("Filtering by type:", type);
    // Update the active recipe tab state.
    setActiveRecipeTab(type);
    // Update the filteredRecipes state based on the selected type. Show all if 'All' is selected.
    setFilteredRecipes(type === "All" ? recipes : recipes.filter((r) => r.type === type));
  };
  // Define a handler for changing the rating for a specific recipe.
  const handleRatingChange = (recipeId, rating) => { /* ... (same - recipe rating) ... */
    // Update the ratings state, adding or updating the rating for the given recipeId.
    setRatings((prev) => ({ ...prev, [recipeId]: rating }));
  };
  // Define an async function to submit a rating for a specific recipe.
  const submitRating = async (recipeId) => { /* ... (same - recipe rating) ... */
    // Get the rating value for the specific recipe from the state.
    const ratingValueSubmit = ratings[recipeId];
    // Validate: Check if a rating value exists and if the user is logged in (token exists).
    if (!ratingValueSubmit || !token) {
        // If no token, log out.
        if (!token) handleLogout();
        // If no rating selected, alert the user.
        if(!ratingValueSubmit) alert("Please select a rating (1-5 stars) first.");
        // Exit the function.
        return;
    }
    // Log the rating submission details.
    console.log(`Submitting rating ${ratingValueSubmit} for recipe ${recipeId}`);
    // Clear previous general errors.
    setError(null);
    // Start a try block for the API call.
    try {
      // Make a POST request to the /api/Ratings endpoint.
      const res = await fetch(`${API_BASE_URL}/api/Ratings`, {
        // Specify POST method.
        method: "POST",
        // Set headers for JSON content type and authorization.
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        // Send the recipeId and rating value in the request body.
        body: JSON.stringify({ recipeId: recipeId, rating: ratingValueSubmit }),
      });
      // If the submission was successful.
      if (res.ok) {
        // Show a success alert.
        alert("Rating submitted successfully!");
        // Remove the submitted rating from the local 'ratings' state to clear the input for that recipe.
        setRatings(prev => { const newState = {...prev}; delete newState[recipeId]; return newState; });
      // If the submission failed.
      } else {
        // Prepare a default error message.
        let errorMsg = `Rating submission failed (Status: ${res.status})`;
        // Try to get a specific error message from the response.
        try { errorMsg = (await res.json()).message || errorMsg; } catch {}
        // Set the general error state.
        setError(`Rating submission failed: ${errorMsg}`);
        // Show an alert with the error.
        alert(`Rating submission failed: ${errorMsg}`);
        // If unauthorized, log out.
        if (res.status === 401) handleLogout();
      }
    // Catch network or other errors.
    } catch (err) {
      // Set a generic network error message.
      setError("A network error occurred while submitting rating.");
      // Show a generic network error alert.
      alert("A network error occurred while submitting rating.");
    }
  };

  // JSX comment indicating the re-added function for platform review submission.
  // <<< Re-added function to handle PLATFORM Review Submission >>>
  // Define an async function to handle the submission of the platform review form.
  const handleReviewSubmit = async (e) => {
      // Prevent default form submission behavior.
      e.preventDefault();
      // Clear any previous submission messages.
      setSubmitMessage({ type: '', text: '' });
      // Validate the form input: check for review text length and rating value.
      // Use ratingValue (from platform review form) not ratings[id]
      if (!reviewText.trim() || reviewText.length < 5 || reviewText.length > 1000 || ratingValue < 1) {
           // Set an error message if validation fails.
           setSubmitMessage({ type: 'error', text: 'Please provide a rating (1-5 stars) and a review (5-1000 characters).' });
           // Exit the function.
           return;
       }
      // Set the submitting state to true to disable the button.
      setIsSubmittingReview(true);
      // Clear previous general errors.
      setError(null); // Clear previous general errors
      // Start a try block for the API call.
      try {
          // Submit the review to the public endpoint for creating reviews.
          const res = await fetch(`${API_BASE_URL}/api/PublicReviews`, {
              // Specify POST method.
              method: "POST",
              // Set headers for JSON content type. No Auth token typically needed for public submission.
              headers: { 'Content-Type': 'application/json' }, // No Auth token needed usually for public submission
              // Send the review text and platform rating value in the body.
              body: JSON.stringify({ reviewText, ratingValue }), // Send platform rating value
          });
          // Check if the submission was successful (OK or Created status).
          if (res.ok || res.status === 201) {
              // Set a success message.
              setSubmitMessage({ type: 'success', text: 'Thank you! Your review has been submitted for approval.' });
              // Clear the review form fields.
              setReviewText(""); setRatingValue(0); // Clear form
              // JSX comment about optional re-fetching of reviews.
              // Optionally re-fetch approved reviews if you want immediate (but maybe slightly delayed) feedback
              // await fetchApprovedReviews();
          // If the submission failed.
          } else {
              // Prepare a default error message.
              let errorMessage = "Failed to submit review.";
              // Try to get a specific error message from the response.
              try { errorMessage = (await res.json()).message || errorMessage; } catch {}
              // Set an error message.
              setSubmitMessage({ type: 'error', text: `Error: ${errorMessage}` });
          }
      // Catch network or other errors.
      } catch (error) {
           // Log the error.
           console.error("Error submitting platform review:", error)
           // Set a generic network error message.
           setSubmitMessage({ type: 'error', text: 'A network error occurred during review submission.' });
      // Finally block ensures this runs regardless of success or failure.
      } finally {
          // Set the submitting state back to false.
          setIsSubmittingReview(false);
      }
  };
  // JSX comment indicating the end of the re-added review submission function.
  // <<< END re-added review submission function >>>


  // JSX comment indicating the start of the render logic.
  // --- Render Logic ---
  // Return the JSX structure for the dashboard component.
  return (
    // Main container div for the entire dashboard page, applying specific classes.
    <div className="foodlover-dashboard-page with-home-content">
      {/* JSX comment indicating the Navigation Bar section. */}
      {/* --- Navigation Bar --- */}
      {/* Navigation bar element with specific class. */}
      <nav className="dashboard-navbar">
        {/* Brand/logo section of the navbar. */}
        <div className="navbar-brand">
            {/* Link to the home view, preventing default link behavior and using handleNavClick. */}
            <Link to="#" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>RecipeNest</Link>
        </div>
        {/* Container for navigation actions/buttons. */}
        <div className="navbar-actions">
            {/* Button to navigate to the 'home' view. Dynamically adds 'active' class. Disabled while loading. */}
            <button onClick={() => handleNavClick('home')} className={`navbar-button ${activeView === 'home' ? "active" : ""}`} disabled={isLoading}>Home</button>
            {/* Button to navigate to the 'recipes' view. Dynamically adds 'active' class. Disabled while loading. */}
            <button onClick={() => handleNavClick('recipes')} className={`navbar-button ${activeView === 'recipes' ? "active" : ""}`} disabled={isLoading}>Recipes</button>
            {/* Standard Link component for navigating to the '/about-us' route. */}
            <Link to="/about-us" className="navbar-button">About Us</Link>
            {/* Button to navigate to the 'profile' view. Dynamically adds 'active' class. Disabled while loading. */}
            <button onClick={() => handleNavClick('profile')} className={`navbar-button ${activeView === 'profile' ? "active" : ""}`} disabled={isLoading}>Update Profile</button>
            {/* Button to trigger the logout process. */}
            <button onClick={handleLogout} className="navbar-button logout-button">Logout</button>
        </div>
      </nav>

      {/* JSX comment indicating the Main Content Area. */}
      {/* --- Main Content Area --- */}
      {/* Container for the main content displayed below the navbar. */}
      <div className="dashboard-main-content">
        {/* Conditional rendering: Display overall loading indicator if initial data is still fetching. */}
        {isLoading && <p className="loading-message">Loading dashboard data...</p>}
        {/* Conditional rendering: Display general error message if an error occurred and not loading. */}
        {error && !isLoading && <p className="error-message">Error: {error}</p>}

        {/* Conditional rendering: Only render the main content if not loading and no general error exists. */}
        {!isLoading && !error && (
          // React Fragment to group multiple elements without adding an extra node to the DOM.
          <>
            {/* JSX comment indicating the Home View section. */}
            {/* --- Home View (With Reviews) --- */}
            {/* Conditional rendering: Display this section only if the active view is 'home'. */}
            {activeView === 'home' && (
              // Container div for the home view, using classes for styling from both CSS files.
              <div className="dashboard-home-view home-container">
                {/* Hero Section component reused from Home.css styles. */}
                <header className="hero-section">
                    {/* Text content within the hero section. */}
                    <div className="hero-text">
                        {/* Welcome message, personalized with user's name or default. */}
                        <h1>Welcome, {foodLoverDetails.name || 'Food Lover'}!</h1>
                        {/* Introductory paragraph. */}
                        <p>Explore new recipes, manage your profile, and share your culinary passion.</p>
                        {/* Container for hero action buttons. */}
                        <div className="hero-buttons">
                            {/* Button to navigate to the recipes view. */}
                            <button onClick={() => handleNavClick('recipes')} className="btn-base btn-light">Browse Recipes</button>
                            {/* Button to navigate to the profile update view. */}
                            <button onClick={() => handleNavClick('profile')} className="btn-base btn-dark">Update My Profile</button>
                        </div>
                    </div>
                    {/* Image container within the hero section. */}
                    <div className="hero-image">
                        {/* Hero image element. */}
                        <img src="/images/Side-image-for-recipenest.jpeg" alt="Cooking" className="hero-img" />
                    </div>
                </header>
                {/* Community Section component reused from Home.css styles. */}
                <section className="community-section section-padding">
                     {/* Heading for the community section. */}
                     <h1>Cooking together with the experts.</h1>
                     {/* Description text for the community section. */}
                     <p>Cooking is more fun when done together! Join expert chefs...</p>
                     {/* Button to navigate to the recipes view. */}
                     <button onClick={() => handleNavClick('recipes')} className="btn-base btn-join btn-light">Explore Recipes</button>
                     {/* Image container for the community section. */}
                     <div className="community-image">
                         {/* Community section image. */}
                         <img src="/images/chef6recipenest-removebg-preview.png" alt="Community Cooking" />
                     </div>
                </section>

                {/* JSX comment indicating the re-added Reviews section. */}
                {/* ==== REVIEWS SECTION RE-ADDED ==== */}
                {/* Reviews Section component reused from Home.css styles. */}
                <section className="reviews-section section-padding">
                    {/* Heading for the reviews section. */}
                    <h1>Reviews and Ratings</h1>
                    {/* Form for submitting a review about the platform itself. */}
                    <form onSubmit={handleReviewSubmit} className="review-form">
                        {/* Subheading for the review form. */}
                        <h3>Leave a Review About RecipeNest</h3>
                        {/* Form group for the star rating input. */}
                        <div className="form-group star-rating-group">
                            {/* Label for the rating input. */}
                            <label>Your Rating:</label>
                            {/* Reusable StarRatingInput component for platform rating. */}
                            {/* Use ratingValue state for platform review */}
                            <StarRatingInput rating={ratingValue} setRating={setRatingValue} />
                        </div>
                        {/* Form group for the review text area. */}
                        <div className="form-group">
                            {/* Label for the text area. */}
                            <label htmlFor="reviewText">Your Review:</label>
                            {/* Text area for entering the review text. */}
                            <textarea id="reviewText" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your thoughts about the platform..." rows="4" maxLength="1000" required/>
                        </div>
                        {/* Conditional rendering: Display submission message (success/error) if it exists. */}
                        {submitMessage.text && <p className={`submit-message ${submitMessage.type}`}>{submitMessage.text}</p>}
                        {/* Submit button for the platform review form. Disabled while submitting. */}
                        <button type="submit" className="btn-submit-review" disabled={isSubmittingReview}>
                            {/* Dynamically change button text based on submission status. */}
                            {isSubmittingReview ? 'Submitting...' : 'Submit Platform Review'}
                        </button>
                    </form>
                    {/* Container for displaying approved public reviews. */}
                    <div className="approved-reviews-display">
                        {/* Heading for the displayed reviews section. */}
                        <h2>What Others Are Saying</h2>
                        {/* Conditional rendering: Show loading message while fetching reviews. */}
                        {isLoadingReviews && <p className="loading-message">Loading reviews...</p>}
                        {/* Conditional rendering: Show message if not loading and no reviews are available. */}
                        {!isLoadingReviews && approvedReviews.length === 0 && <p className="info-message">No reviews available yet. Be the first!</p>}
                        {/* Conditional rendering: Display the list of reviews if not loading and reviews exist. */}
                        {!isLoadingReviews && approvedReviews.length > 0 && (
                            // Container div for the list of public reviews.
                            <div className="review-list public-review-list">
                                {/* Map over the approvedReviews array to render each review card. */}
                                {approvedReviews.map(review => (
                                    // Individual review card div with unique key.
                                    <div key={review.id} className="review-card public-review-card">
                                        {/* Header section of the review card. */}
                                        <div className="review-header">
                                            {/* Display stars based on the review's ratingValue using the helper function. */}
                                            {renderStarsDisplay(review.ratingValue)}
                                            {/* Display the submission date, formatted locally. */}
                                            <span className="review-date">{new Date(review.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                        {/* Display the review text. */}
                                        <p className="review-text">{review.reviewText}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                {/* JSX comment indicating the end of the re-added Reviews section. */}
                {/* ==== END REVIEWS SECTION ==== */}

                {/* Footer Section component reused from Home.css styles. */}
                <footer className="footer-section">
                    {/* Footer text with dynamic year and copyright notice. */}
                    <p>© {new Date().getFullYear()} RecipeNest. All Rights Reserved.</p>
                </footer>
              </div>
            )}

            {/* JSX comment indicating the Recipes View section. */}
            {/* --- Recipes View (Using White Card/Black Text styles) --- */}
            {/* Conditional rendering: Display this section only if the active view is 'recipes'. */}
            {activeView === 'recipes' && (
              // Container div for the recipes view.
              <div className="dashboard-recipes-view">
                {/* Heading for the recipes view. */}
                <h1>Explore Recipes</h1>
                {/* Container for category filter tabs. */}
                <div className="category-tabs">
                  {/* Map over an array of category names to create filter buttons. */}
                  {["All", "Main Dish", "Fast Food", "Dessert"].map((cat) => (
                    // Button for each category.
                    <button
                      // Unique key for each button.
                      key={cat}
                      // Apply 'active' class dynamically based on the activeRecipeTab state.
                      className={`tab-button ${activeRecipeTab === cat ? "active" : ""}`}
                      // Call filterRecipesByCategory when the button is clicked.
                      onClick={() => filterRecipesByCategory(cat)}
                    >
                      {/* Display the category name on the button. */}
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Container for the list of recipe cards. */}
                <div className="recipe-list">
                  {/* Conditional rendering: Show message if no recipes match the current filter. */}
                  {filteredRecipes.length === 0 ? ( <p className="info-message">No recipes found for "{activeRecipeTab}".</p> )
                  // Otherwise, map over the filteredRecipes array to display recipe cards.
                  : ( filteredRecipes.map((recipe) => {
                      // Determine the correct recipe ID, handling potential inconsistencies in data shape.
                      const currentRecipeId = recipe.recipeId || recipe.id;
                      // If no ID is found, log a warning and skip rendering this recipe.
                      if (!currentRecipeId) { console.warn("Recipe missing ID:", recipe); return null; }
                      // Encode the current page origin + recipe path for sharing URLs.
                      const shareUrl = encodeURIComponent(window.location.origin + `/recipe/${currentRecipeId}`);
                      // Encode the recipe title or a default text for sharing.
                      const shareTitle = encodeURIComponent(recipe.title || "Check out this recipe!");
                      // Construct the Twitter share URL.
                      const twitterShare = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
                      // Construct the Facebook share URL.
                      const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
                      // Construct the WhatsApp share URL.
                      const whatsappShare = `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`;
                      // Define the base Instagram link (actual sharing usually requires app integration).
                      const instagramLink = "https://instagram.com";

                      // Return the JSX for a single recipe card.
                      return (
                        // Recipe card container div with unique key. Applies white card style.
                        <div key={currentRecipeId} className="recipe-card"> {/* Using White Card Style */}
                          {/* Container for the recipe image. */}
                          <div className="recipe-image-container">
                            {/* Conditional rendering: Display image if imageUrl exists. */}
                            {recipe.imageUrl ? (
                              // Image element. Handles relative URLs from API_BASE_URL.
                              <img
                                src={recipe.imageUrl.startsWith('/') ? `${API_BASE_URL}${recipe.imageUrl}` : recipe.imageUrl}
                                alt={recipe.title || "Recipe Image"}
                                className="recipe-image"
                                // Error handler to display a default image if the primary image fails to load.
                                onError={(e) => { e.target.onerror = null; e.target.src='/images/default-food.png'; }}
                                // Enable lazy loading for images.
                                loading="lazy"
                              />
                            // If no imageUrl, display a placeholder.
                            ) : (
                              <div className="recipe-image-placeholder"><span>No Image</span></div>
                            )}
                          </div>
                          {/* Container for recipe text content and actions. */}
                          <div className="recipe-content-container">
                            {/* Recipe title heading (black text). */}
                            <h3>{recipe.title || "Untitled Recipe"}</h3> {/* Black text */}
                            {/* Recipe type paragraph (black/dark grey text). */}
                            <p><strong>Type:</strong> {recipe.type || "N/A"}</p> {/* Black/Dark grey text */}
                            {/* Recipe description paragraph (dark grey text). */}
                            <p className="recipe-description"><strong>Description:</strong> {recipe.description || "No description available."}</p> {/* Dark grey text */}
                            {/* Section for rating the recipe. */}
                            <div className="rating-section">
                              {/* Label for rating stars (dark grey text). */}
                              <p>Rate this recipe:</p> {/* Dark grey text */}
                              {/* Container for the interactive rating stars. */}
                              <div className="rating-stars">
                                {/* Map to create 5 interactive star spans for rating input. */}
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    // Unique key for the star.
                                    key={star}
                                    // Apply 'selected' class if the current rating in state is >= this star's value.
                                    className={`star ${ratings[currentRecipeId] >= star ? "selected" : ""}`}
                                    // Call handleRatingChange when a star is clicked.
                                    onClick={() => handleRatingChange(currentRecipeId, star)}
                                    // Accessibility: make it a button role.
                                    role="button"
                                    // Accessibility: allow focus.
                                    tabIndex="0"
                                    // Accessibility: allow rating via keyboard.
                                    onKeyDown={(e)=>(e.key==='Enter'||e.key===' ')&&handleRatingChange(currentRecipeId,star)}
                                    // Accessibility: ARIA label.
                                    aria-label={`Rate ${star} stars`}
                                  >★</span>
                                ))}
                              </div>
                              {/* Button to submit the selected rating. Disabled if no rating is selected. */}
                              <button onClick={() => submitRating(currentRecipeId)} className="action-button rate-button" disabled={!ratings[currentRecipeId]}> Submit Rating </button>
                            </div>
                            {/* Section for social media sharing links. */}
                            <div className="social-share-section">
                              {/* Label for sharing links (dark grey text). */}
                              <p>Share this recipe:</p> {/* Dark grey text */}
                              {/* Container for social media icons. */}
                              <div className="social-icons">
                                {/* Facebook share link. */}
                                <a href={facebookShare} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="social-icon facebook"> <i className="fab fa-facebook-f"></i> </a>
                                {/* Twitter share link. */}
                                <a href={twitterShare} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="social-icon twitter"> <i className="fab fa-twitter"></i> </a>
                                {/* WhatsApp share link. */}
                                <a href={whatsappShare} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="social-icon whatsapp"> <i className="fab fa-whatsapp"></i> </a>
                                {/* Instagram link (direct sharing is complex). */}
                                <a href={instagramLink} target="_blank" rel="noopener noreferrer" aria-label="Share on Instagram" className="social-icon instagram"> <i className="fab fa-instagram"></i> </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* JSX comment indicating the Profile Update View section. */}
            {/* --- Profile Update View (Dark themed) --- */}
            {/* Conditional rendering: Display this section only if the active view is 'profile'. */}
            {activeView === 'profile' && (
              // Container for the profile update form, using dark theme styles.
              <div className="profile-update-container">
                {/* Form element for profile update, triggering updateProfile on submit. */}
                <form onSubmit={updateProfile} className="profile-form">
                  {/* Heading for the form. */}
                  <h3>Update Your Profile</h3>
                  {/* Informational text. */}
                  <p>Keep your information up-to-date.</p>
                  {/* Label for the name input. */}
                  <label htmlFor="name">Name:</label>
                  {/* Input field for the user's name. */}
                  <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                  {/* Label for the email input. */}
                  <label htmlFor="email">Email:</label>
                  {/* Input field for the user's email. */}
                  <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  {/* Label for the new password input. */}
                  <label htmlFor="password">New Password (leave blank to keep current):</label>
                  {/* Input field for the new password (optional). */}
                  <input id="password" type="password" name="password" value={formData.password} placeholder="Enter new password only if changing" onChange={handleInputChange} autoComplete="new-password" />
                  {/* Submit button for the profile update form. Disabled while loading. */}
                  <button type="submit" className="action-button" disabled={isLoading}>
                    {/* Dynamically change button text based on loading state. */}
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                  {/* Cancel button to navigate back to the home view. */}
                  <button type="button" onClick={() => handleNavClick('home')} className="action-button cancel-button" disabled={isLoading}>Cancel</button>
                </form>
              </div>
            )}
          </> // End React Fragment
        )}
      </div> {/* End dashboard-main-content */}
    </div> // End foodlover-dashboard-page
  );
// Close the FoodLoverDashboardComponent definition.
};

// Export the component as the default export of this module.
export default FoodLoverDashboardComponent;