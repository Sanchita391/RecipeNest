// AdmindashboardComponent.jsx
// Import the main React library and specific hooks (useState, useEffect, useCallback) for managing state, side effects, and memoized functions.
import React, { useState, useEffect, useCallback } from "react";
// Import navigation hooks and components from react-router-dom for handling routing and links.
import { useNavigate, Link } from "react-router-dom";
// Import the CSS file associated with this component for styling.
import "./AdmindashboardComponent.css"; // Make sure this CSS file exists and is correct

// Define the Base URL for your API endpoint as a constant for easy modification.
const API_BASE_URL = "https://localhost:7092";

// --- Helper Functions ---
// Define a helper function to render star ratings based on a numerical rating value.
const renderStars = (rating) => {
  // Initialize an empty array to store the star span elements.
  const stars = [];
  // Round the rating to the nearest whole number, defaulting to 0 if the rating is null or undefined.
  const roundedRating = Math.round(rating || 0); // Handle potential null/undefined rating
  // Loop 5 times to generate 5 star elements.
  for (let i = 1; i <= 5; i++) {
    // Push a span element for each star. Apply 'filled' class if 'i' is less than or equal to the rounded rating.
    stars.push(<span key={i} className={i <= roundedRating ? "star filled" : "star"}>★</span>);
  }
  // Return the array of star spans wrapped in a div container.
  return <div className="star-rating-display">{stars}</div>;
};

// Define a helper function to convert a status code (number or string) into human-readable text.
const getStatusText = (status) => {
  // Handles both potential number or string status values from API.
  // Convert the input status to a lowercase string for case-insensitive comparison.
  switch (String(status).toLowerCase()) { // Normalize to lowercase string
    // If the status is '0' or 'pending', return 'Pending'.
    case '0': case 'pending': return 'Pending';
    // If the status is '1' or 'approved', return 'Approved'.
    case '1': case 'approved': return 'Approved';
    // If the status is '2' or 'rejected', return 'Rejected'.
    case '2': case 'rejected': return 'Rejected';
    // For any other status value, return 'Unknown'.
    default: return 'Unknown';
  }
};

// Helper function for constructing full Image URLs. Handles relative/absolute paths and provides default images.
const getFullImageUrl = (relativePathOrUrl, isProfile = false) => {
    // Determine the default image path based on whether it's a profile image or a food image.
    const defaultImage = isProfile ? '/images/default-avatar.png' : '/images/default-food.png'; // Different defaults
    // If no path or URL is provided, return the path to the default image.
    if (!relativePathOrUrl) {
        // Return the determined default image path.
        return defaultImage;
    }
    // If the provided string already starts with 'http://' or 'https://', assume it's a full URL.
    if (relativePathOrUrl.startsWith('http://') || relativePathOrUrl.startsWith('https://')) {
        // Return the full URL as is.
        return relativePathOrUrl;
    }
    // Assume it's a relative path that needs to be appended to the API base URL.
    // Ensure the API base URL does not have a trailing slash.
    const basePath = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    // Ensure the relative path starts with a leading slash.
    const relativePath = relativePathOrUrl.startsWith('/') ? relativePathOrUrl : `/${relativePathOrUrl}`;
    // Construct and return the full URL by combining the base path and the relative path.
    return `${basePath}${relativePath}`;
};


// --- Component ---
// Define the main functional component for the Admin Dashboard.
const AdmindashboardComponent = () => {
  // --- State ---
  // State variable to store the list of all recipes fetched for the admin. Initialized as an empty array.
  const [recipes, setRecipes] = useState([]);
  // State variable to store the list of all reviews fetched for management. Initialized as an empty array.
  const [reviews, setReviews] = useState([]);
  // State variable to track whether recipes are currently being loaded. Initialized to true.
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  // State variable to track whether reviews are currently being loaded. Initialized to true.
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  // State variable to track whether the admin's own details are being loaded. Initialized to true.
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  // State variable to track whether details for a single recipe are loading. Initialized to false.
  const [isLoadingRecipeDetail, setIsLoadingRecipeDetail] = useState(false);
  // State variable to store any error message related to fetching recipes. Initialized to null.
  const [fetchRecipeError, setFetchRecipeError] = useState(null);
  // State variable to store any error message related to fetching reviews. Initialized to null.
  const [fetchReviewError, setFetchReviewError] = useState(null);
  // State variable to store any error message related to fetching admin details. Initialized to null.
  const [fetchAdminError, setFetchAdminError] = useState(null);
  // State variable to store any error message related to fetching single recipe details. Initialized to null.
  const [fetchRecipeDetailError, setFetchRecipeDetailError] = useState(null);
  // State variable to store the details of the logged-in admin user. Initialized as an empty object.
  const [adminDetails, setAdminDetails] = useState({});
  // State variable to keep track of the currently active section in the dashboard ('home', 'recipes', 'reviews'). Initialized to 'home'.
  const [activeSection, setActiveSection] = useState('home'); // Default to 'home'
  // State variable to store the data of the recipe currently being viewed in detail. Initialized to null.
  const [viewingRecipe, setViewingRecipe] = useState(null); // Stores detailed recipe data
  // Retrieve the authentication token from browser's local storage. Note: This is read once on render, potentially stale if not re-read inside effects/callbacks.
  const token = localStorage.getItem("token");
  // Get the navigate function from react-router-dom to programmatically change routes.
  const navigate = useNavigate();

  // --- Handlers & Fetch Logic ---

  // Comment indicating this logout handler includes a confirmation step.
  // *** UPDATED handleLogout with Confirmation ***
  // Define a memoized callback function for handling the admin logout process.
  const handleLogout = useCallback(() => {
    // Show a confirmation dialog to the user before logging out.
    if (window.confirm("Are you sure you want to log out?")) {
      // Log a message indicating the logout process has started.
      console.log("Logging out admin...");
      // Remove the authentication token from local storage.
      localStorage.removeItem("token");
      // Also remove the stored user role from local storage.
      localStorage.removeItem("role"); // Also remove role
      // Redirect the user to the login page using the navigate function.
      navigate("/login"); // Redirect to login page
    // If the user clicks 'Cancel' on the confirmation dialog.
    } else {
      // Log a message indicating that the logout was cancelled by the user.
      console.log("Logout cancelled by user.");
    }
  // Memoization dependency array: re-create the function only if 'navigate' changes (which is very unlikely).
  }, [navigate]); // Dependency: navigate

  // Define a handler function for when a navigation link/button is clicked.
  const handleNavClick = (section) => {
    // Log the section identifier that was clicked.
    console.log("Switching admin section to:", section);
    // Reset the detailed recipe view state to null when changing sections.
    setViewingRecipe(null); // Clear detailed view when switching sections
    // Reset the error state associated with fetching recipe details.
    setFetchRecipeDetailError(null); // Clear detail error
    // Update the active section state to the newly selected section.
    setActiveSection(section);
    // Scroll the window to the top for better user experience on section change.
    window.scrollTo(0, 0); // Scroll to top on section change
  };

  // Define a centralized, memoized function for making API calls.
  const callApi = useCallback(async (url, options = {}) => {
    // Get the current authentication token from local storage *each time* the function is called to ensure freshness.
    const currentToken = localStorage.getItem("token"); // Get fresh token on each call
    // Check if a token exists.
    if (!currentToken) {
      // Log an error if no token is found.
      console.error("callApi: No token found, logging out.");
      // Trigger the logout process using the memoized handleLogout function.
      handleLogout(); // Use the callback version
      // Throw an error to stop the execution of the function that called callApi.
      throw new Error("No token available. User logged out.");
    }

    // Start a try block to handle potential errors during the fetch operation.
    try {
      // Make the asynchronous network request using the browser's fetch API.
      const response = await fetch(url, {
        // Spread any options passed into the function (e.g., method, body).
        ...options,
        // Define or override request headers.
        headers: {
          // Spread any headers passed in the options object first.
          ...options.headers,
          // Add the Authorization header with the Bearer token.
          Authorization: `Bearer ${currentToken}`, // Use the fresh token
          // Set the Content-Type header, defaulting to 'application/json' if not provided in options.
          'Content-Type': options.headers?.['Content-Type'] || 'application/json',
        },
        // End of headers object.
      });

      // Check if the response status is 401 (Unauthorized) or 403 (Forbidden).
      if (response.status === 401 || response.status === 403) {
        // Log an error indicating the authorization failure.
        console.error(`callApi: Unauthorized/Forbidden (${response.status}) on ${url}. Logging out.`);
        // Trigger the logout process.
        handleLogout(); // Use the callback version
        // Throw a specific error message to indicate authorization failure.
        throw new Error("Authorization failed. Please log in again.");
      }

      // Check if the response status is 204 (No Content), common for successful DELETE or some PUT requests.
      if (response.status === 204) {
          // Return a success object with null data, as there's no body content.
          return { success: true, data: null };
      }

      // Comment indicating the next step is to parse the response body.
      // Attempt to parse JSON first
      // Declare a variable to hold the parsed JSON data.
      let data;
      // Declare a variable to hold the raw response body text in case JSON parsing fails.
      let errorBody = '';
      // Start a try block specifically for parsing the JSON response.
      try {
          // Attempt to parse the response body as JSON.
          data = await response.json();
      // Catch any errors that occur during JSON parsing.
      } catch (jsonError) {
          // If JSON parsing fails, attempt to read the response body as text.
          // If JSON fails, try to read as text (especially for non-2xx responses)
          // Start a nested try block to read the response as text.
          try {
              // Attempt to read the response body as plain text.
              errorBody = await response.text();
              // Log a warning message indicating JSON parse failure but successful text read. Include URL, status, and snippet of the body.
              console.warn(`callApi: Failed to parse JSON, received text response from ${url}. Status: ${response.status}. Body: ${errorBody.substring(0, 200)}`);
          // Catch any errors during the text reading attempt (less common).
          } catch (textError) {
              // Log an error if both JSON parsing and text reading failed.
              console.error(`callApi: Failed to parse JSON and failed to read text response from ${url}. Status: ${response.status}.`, textError);
          }
          // If the response status indicated success (e.g., 200 OK) but the body wasn't valid JSON.
          // If it was supposed to be a successful response but wasn't JSON, treat as error
          if(response.ok) {
              // Throw an error indicating the unexpected response format for a successful status code.
              throw new Error("API response was successful but not valid JSON.");
          }
      // End of the outer catch block for JSON parsing errors.
      }

      // Check if the response status code indicates an unsuccessful request (e.g., 4xx or 5xx).
      if (!response.ok) {
        // Initialize a default error message using the status code.
        let errorMessage = `Request failed: ${response.status}`;
        // Attempt to extract a more specific error message from the parsed JSON data (if available), or use the raw error body text, or fall back to the default message.
        errorMessage = data?.message || data?.title || JSON.stringify(data?.errors || data) || errorBody || errorMessage;
        // Throw an error with the determined error message.
        throw new Error(errorMessage);
      }

      // If the request was successful (response.ok is true) and JSON parsing succeeded (or was not needed for 204).
      // Return an object indicating success and containing the parsed data.
      return { success: true, data: data };

    // Catch any errors that occurred during the try block (network errors, JSON parsing errors, manually thrown errors).
    } catch (error) {
      // Log the detailed error information, including the URL, options, and the error object itself.
      console.error(`API call failed: ${error.message}`, { url, options, error });
      // Determine the error message to return: Keep specific auth/token error messages, otherwise use the error's message or a generic fallback.
      const returnedError = (error.message === "Authorization failed. Please log in again." || error.message === "No token available. User logged out.")
        ? error.message // Keep specific auth/token error messages
        : (error.message || "An unknown network or API error occurred"); // Use error message or generic fallback
      // Avoid setting UI state (like error messages) directly within callApi; let the calling function handle UI updates based on the result.
      // Return an object indicating failure and providing the processed error message.
      return { success: false, error: returnedError };
    }
  // Memoization dependency array: depends on `handleLogout` (which is stable due to its own `useCallback`).
  }, [handleLogout]); // Dependency: handleLogout (stable due to useCallback)

  // Define a memoized async function to fetch the details of the currently logged-in admin user.
  const fetchAdminDetails = useCallback(async () => {
    // Log a message indicating the start of the admin details fetch process.
    console.log("Fetching Admin details...");
    // Set the loading state for admin details to true.
    setIsLoadingAdmin(true);
    // Clear any previous error message related to fetching admin details.
    setFetchAdminError(null);
    // Start a try block to handle potential errors during the API call.
    try {
      // Pass an empty options object for a standard GET request to callApi.
      // Call the centralized API function to fetch data from the '/api/Users/me' endpoint.
      const res = await callApi(`${API_BASE_URL}/api/Users/me`, {});
      // If the API call was not successful (res.success is false), throw an error using the message returned by callApi.
      if (!res.success) throw new Error(res.error);
      // Update the adminDetails state with the data received from the API, defaulting to an empty object if data is null/undefined.
      setAdminDetails(res.data || {});
      // Log the successfully fetched admin details to the console.
      console.log("Fetched admin details:", res.data);
      // Return the fetched data, which might be used by Promise.allSettled or other callers.
      return res.data;
    // Catch any errors that occur during the try block (e.g., network issues, errors thrown from callApi).
    } catch (err) {
      // Log the error encountered during the fetch process.
      console.error("Error fetchAdminDetails:", err);
      // Update the fetchAdminError state with the error message.
      setFetchAdminError(err.message);
      // Note: Logout on authorization failure (401/403) is handled automatically within the callApi function.
      // Logout is handled by callApi/handleLogout
    // Execute the finally block regardless of whether the try block succeeded or failed.
    } finally {
      // Set the loading state for admin details back to false.
      setIsLoadingAdmin(false);
    }
  // Memoization dependency array: re-create this function only if `callApi` changes (which depends on `handleLogout`).
  }, [callApi]); // Dependency: callApi

  // Define a memoized async function to fetch all recipes using the admin-specific endpoint.
  const fetchAllRecipes = useCallback(async () => {
    // Set the loading state for recipes to true.
    setIsLoadingRecipes(true);
    // Clear any previous error message related to fetching recipes.
    setFetchRecipeError(null);
    // Log a message indicating the start of the admin recipe fetch process.
    console.log("Admin fetching all recipes...");
    // Start a try block to handle potential errors during the API call.
    try {
      // Call the centralized API function to fetch data from the '/api/recipes/all' endpoint.
      const res = await callApi(`${API_BASE_URL}/api/recipes/all`, {});
      // If the API call was not successful, throw an error using the message returned by callApi.
      if (!res.success) throw new Error(res.error);
      // Log the number of recipes received (using optional chaining for safety if res.data is null/undefined).
      console.log("Admin received recipes:", res.data?.length);
      // Update the recipes state. Ensure the value set is always an array, even if the API returns something unexpected.
      setRecipes(Array.isArray(res.data) ? res.data : []);
      // Return the fetched data.
      return res.data;
    // Catch any errors that occur during the try block.
    } catch (err) {
      // Log the error encountered while fetching recipes.
      console.error("Failed to load recipes:", err);
      // Update the fetchRecipeError state with a user-friendly message including the original error.
      setFetchRecipeError(`Failed to load recipes: ${err.message}`);
      // Set the recipes state to an empty array in case of an error.
      setRecipes([]);
    // Execute the finally block regardless of success or failure.
    } finally {
      // Set the loading state for recipes back to false.
      setIsLoadingRecipes(false);
    }
  // Memoization dependency array: depends on `callApi`.
  }, [callApi]); // Dependency: callApi

  // Define a memoized async function to fetch all reviews using the admin management endpoint.
  const fetchReviewsForManagement = useCallback(async () => {
    // Set the loading state for reviews to true.
    setIsLoadingReviews(true);
    // Clear any previous error message related to fetching reviews.
    setFetchReviewError(null);
    // Log a message indicating the start of the admin review fetch process.
    console.log("Admin fetching reviews for management...");
    // Start a try block to handle potential errors during the API call.
    try {
      // Call the centralized API function to fetch data from the '/api/PublicReviews/manage' endpoint.
      const res = await callApi(`${API_BASE_URL}/api/PublicReviews/manage`, {});
      // If the API call was not successful, throw an error using the message returned by callApi.
      if (!res.success) throw new Error(res.error);
      // Ensure the received data is treated as an array, defaulting to an empty array if it's not.
      const reviewsArray = Array.isArray(res.data) ? res.data : [];
      // Log the number of reviews fetched for management.
      console.log("Admin fetched reviews for management:", reviewsArray.length);
      // Update the reviews state with the fetched (and potentially adjusted) array.
      setReviews(reviewsArray);
      // Return the fetched data.
      return res.data;
    // Catch any errors that occur during the try block.
    } catch (err) {
      // Log the error encountered while fetching reviews.
      console.error("Failed to load reviews:", err);
      // Update the fetchReviewError state with a user-friendly message including the original error.
      setFetchReviewError(`Failed to load reviews: ${err.message}`);
      // Set the reviews state to an empty array in case of an error.
      setReviews([]);
    // Execute the finally block regardless of success or failure.
    } finally {
      // Set the loading state for reviews back to false.
      setIsLoadingReviews(false);
    }
  // Memoization dependency array: depends on `callApi`.
  }, [callApi]); // Dependency: callApi

  // Define a memoized async function to handle fetching and displaying the details of a single recipe.
  const handleViewRecipe = useCallback(async (recipeId) => {
    // If no recipe ID is provided, do nothing and exit the function.
    if (!recipeId) return;
    // Log the ID of the recipe being fetched.
    console.log(`Fetching details for recipe ID: ${recipeId}`);
    // Set the loading state for recipe details to true.
    setIsLoadingRecipeDetail(true);
    // Clear any previous error message related to fetching recipe details.
    setFetchRecipeDetailError(null);
    // Clear any previously viewed recipe data immediately to avoid showing stale data while loading.
    setViewingRecipe(null);
    // Ensure the main navigation visually reflects that the 'recipes' section is active, even when viewing details.
    setActiveSection('recipes'); // Ensure the visual section is recipes when viewing details

    // Start a try block to handle potential errors during the API call.
    try {
      // Call the centralized API function to fetch details for the specific recipe ID.
      const result = await callApi(`${API_BASE_URL}/api/recipes/${recipeId}`, {});
      // Check if the API call was successful and returned data.
      if (result.success && result.data) {
        // Log the successfully fetched recipe details.
        console.log("Recipe details fetched:", result.data);
        // Update the viewingRecipe state with the detailed data received from the API.
        setViewingRecipe(result.data);
      // If the API call failed or returned no data.
      } else {
        // Throw an error using the message from callApi or a default message if none provided.
        throw new Error(result.error || "Recipe details not found or failed to load.");
      }
    // Catch any errors that occur during the try block or are thrown.
    } catch (err) {
      // Log the error encountered while fetching recipe details, including the ID.
      console.error(`Failed to fetch recipe details for ID ${recipeId}:`, err);
      // Update the fetchRecipeDetailError state with a user-friendly message including the original error.
      setFetchRecipeDetailError(`Failed to load recipe details: ${err.message}`);
      // Ensure the viewingRecipe state is null if an error occurred.
      setViewingRecipe(null);
    // Execute the finally block regardless of success or failure.
    } finally {
      // Set the loading state for recipe details back to false.
      setIsLoadingRecipeDetail(false);
    }
  // Memoization dependency array: depends on `callApi`.
  }, [callApi]); // Dependency: callApi

  // Define a memoized callback function to handle closing the detailed recipe view.
  const handleCloseRecipeView = useCallback(() => {
    // Reset the viewingRecipe state to null, hiding the detail view.
    setViewingRecipe(null);
    // Clear any error message related to the recipe detail view.
    setFetchRecipeDetailError(null);
    // Note: No need to change the activeSection here, as the user might want to stay in the 'recipes' list or navigate elsewhere using the main navbar.
    // No need to change section here, user can navigate away using main nav
  // Memoization dependency array is empty because this function only resets state and doesn't depend on external variables or props.
  }, []); // No dependencies, this function only resets state.

  // Define a memoized async function to handle the deletion of a recipe.
  const handleDeleteRecipe = useCallback(async (id) => {
    // Show a confirmation dialog to prevent accidental deletion. If the user cancels, exit the function.
    if (!window.confirm(`Are you sure you want to permanently delete recipe ID ${id}? This cannot be undone.`)) return;
    // Log the attempt to delete the recipe with the specific ID.
    console.log(`Attempting to delete recipe ID: ${id}`);
    // Call the centralized API function to delete the recipe, specifying the DELETE method.
    const result = await callApi(`${API_BASE_URL}/api/recipes/${id}`, { method: "DELETE" });
    // Check if the API call indicated success (callApi handles 204 No Content as success).
    if (result.success) {
      // Show a success message to the user using a browser alert.
      alert("Recipe deleted successfully.");
      // Check if the recipe being deleted was the one currently displayed in the detail view.
      if (viewingRecipe?.id === id) { // If the deleted recipe was being viewed
          // If so, close the detail view first before refreshing the list.
          handleCloseRecipeView(); // Close the detail view first
      }
      // Refresh the list of all recipes to reflect the deletion in the UI.
      fetchAllRecipes(); // Refresh the recipe list
    // If the API call failed.
    } else {
      // Show an error message to the user, including the error details returned by callApi.
      alert(`Failed to delete recipe: ${result.error}`);
      // Log the detailed error information to the console.
      console.error("Delete recipe failed:", result.error);
    }
  // Memoization dependencies: depends on `callApi`, `fetchAllRecipes` (for refresh), `viewingRecipe` state (to check if detail view needs closing), and `handleCloseRecipeView`.
  }, [callApi, fetchAllRecipes, viewingRecipe, handleCloseRecipeView]); // Dependencies

  // Define a memoized async function to handle updating the status of a review (Approve/Reject).
  const handleUpdateReviewStatus = useCallback(async (id, newStatusNumber) => {
    // Get the lowercase text representation of the target status (e.g., 'approved', 'rejected') for the confirmation message.
    const statusText = getStatusText(newStatusNumber).toLowerCase();
    // Show a confirmation dialog. If the user cancels, exit the function.
    if (!window.confirm(`Are you sure you want to set review ID ${id} status to ${statusText}?`)) return;
    // Log the attempt to update the review status with the specific ID and new status number.
    console.log(`Attempting to update review ID ${id} status to ${newStatusNumber}`);

    // Call the centralized API function to update the review status.
    const result = await callApi(
        // Construct the URL for the specific review's status endpoint.
        `${API_BASE_URL}/api/PublicReviews/${id}/status`,
        // Provide options for the API call.
        {
            // Specify the HTTP method as PUT.
            method: "PUT",
            // Set the Content-Type header to indicate a JSON request body.
            headers: { 'Content-Type': 'application/json' },
            // Backend expects the raw status number (0, 1, or 2) directly in the request body.
            // Stringify the number to create a valid JSON body.
            body: JSON.stringify(newStatusNumber),
        }
        // End of options object.
    );

    // Check if the API call indicated success.
    if (result.success) {
      // Show a success message to the user.
      alert(`Review status updated to ${statusText}.`);
      // Refresh the list of reviews to reflect the status change in the UI.
      fetchReviewsForManagement(); // Refresh review list
    // If the API call failed.
    } else {
      // Show an error message to the user, including details from callApi.
      alert(`Failed to update review status: ${result.error}`);
      // Log the detailed error information.
      console.error("Update review status failed:", result.error);
    }
  // Memoization dependencies: depends on `callApi` and `fetchReviewsForManagement` (for refresh).
  }, [callApi, fetchReviewsForManagement]); // Dependencies

  // Define a memoized async function to handle the permanent deletion of a review.
  const handleDeleteReview = useCallback(async (id) => {
    // Show a confirmation dialog. If the user cancels, exit the function.
    if (!window.confirm(`Are you sure you want to permanently delete review ID ${id}? This cannot be undone.`)) return;
    // Log the attempt to delete the review with the specific ID.
    console.log(`Attempting to delete review ID: ${id}`);
    // Call the centralized API function to delete the review, specifying the DELETE method.
    const result = await callApi(`${API_BASE_URL}/api/PublicReviews/${id}`, { method: "DELETE" });
    // Check if the API call indicated success.
    if (result.success) {
      // Show a success message to the user.
      alert("Review deleted successfully.");
      // Refresh the list of reviews to reflect the deletion in the UI.
      fetchReviewsForManagement(); // Refresh review list
    // If the API call failed.
    } else {
      // Show an error message to the user, including details from callApi.
      alert(`Failed to delete review: ${result.error}`);
      // Log the detailed error information.
      console.error("Delete review failed:", result.error);
    }
  // Memoization dependencies: depends on `callApi` and `fetchReviewsForManagement` (for refresh).
  }, [callApi, fetchReviewsForManagement]); // Dependencies

  // Define an effect hook that runs once after the component mounts to fetch initial data.
  useEffect(() => {
    // Retrieve the token from local storage *inside* the effect to get the value at the time of execution.
    const currentToken = localStorage.getItem("token");
    // Check if a token exists when the component mounts.
    if (!currentToken) {
      // Log that no token was found and navigation to login is occurring.
      console.log("No token found on mount, navigating to login.");
      // Redirect the user to the login page.
      navigate("/login");
      // Stop the execution of the rest of the effect if no token is found.
      return; // Stop execution if no token
    }
    // Log that the Admin Dashboard component is mounting and starting the initial data fetch.
    console.log("Admin Dashboard mounting...");
    // Reset loading and error states before starting the fetches to ensure a clean state.
    // Set all primary loading states to true.
    setIsLoadingAdmin(true); setIsLoadingRecipes(true); setIsLoadingReviews(true);
    // Clear any potential stale error messages from previous renders or interactions.
    setFetchAdminError(null); setFetchRecipeError(null); setFetchReviewError(null);

    // Use Promise.allSettled to run all initial data fetching functions concurrently.
    // allSettled waits for all promises to either resolve or reject, making it suitable for fetching independent data sets.
    Promise.allSettled([
      // Call the function to fetch admin details.
      fetchAdminDetails(),
      // Call the function to fetch all recipes.
      fetchAllRecipes(),
      // Call the function to fetch all reviews for management.
      fetchReviewsForManagement()
    // End of the array of promises passed to allSettled.
    ])
    // Use .then() to handle the results after all promises have settled.
    .then((results) => {
      // Log that the initial data fetching attempt (all promises settled) is complete.
      console.log("Initial admin data fetching attempt complete.");
      // Optionally, iterate through the results to check the status of each individual promise.
      // Check results if specific error handling per fetch is needed
      results.forEach((result, index) => {
        // Check if a specific promise was rejected (failed).
        if (result.status === 'rejected') {
          // Log the reason (error) why the specific promise failed.
          console.error(`Initial fetch failed (Promise ${index}):`, result.reason);
        }
        // End of the rejection check.
      });
      // End of the forEach loop iterating through results.
    });
    // Dependency array for the useEffect hook. This effect should re-run only if these functions change.
    // Since these functions are memoized with useCallback, they usually only change if their own dependencies (like callApi or navigate) change.
    // Including navigate ensures the token check runs again if the navigation context somehow changes.
  }, [fetchAdminDetails, fetchAllRecipes, fetchReviewsForManagement, navigate]);


  // --- Render Functions ---

  // Define a memoized function responsible for rendering the detailed view of a single recipe.
  const renderRecipeDetailView = useCallback(() => {
     // Conditionally render: If there's no recipe data currently being viewed, not loading details, and no detail-specific error, render nothing (return null).
     if (!viewingRecipe && !isLoadingRecipeDetail && !fetchRecipeDetailError) return null;

     // Return the JSX structure for the recipe detail view.
     return (
        // Main container div for the recipe detail view with specific admin styling class.
        <div className="recipe-detail-view admin-recipe-detail">
            {/* Button to close the detail view and return to the list. Calls handleCloseRecipeView on click. */}
            <button onClick={handleCloseRecipeView} className="button-back">
                {/* Font Awesome icon for a left arrow. */}
                <i className="fas fa-arrow-left"></i> Back to Recipe List
            </button>

            {/* Heading for the recipe details section. */}
            <h3>Recipe Details</h3>

            {/* Conditional rendering: Display a loading message with a spinner icon if isLoadingRecipeDetail is true. */}
            {isLoadingRecipeDetail && <p className="loading-message"><i className="fas fa-spinner fa-spin"></i> Loading recipe details...</p>}
            {/* Conditional rendering: Display an error message if fetchRecipeDetailError contains an error message string. */}
            {fetchRecipeDetailError && <p className="error-message">{fetchRecipeDetailError}</p>}

            {/* Conditional rendering: Display the main recipe content only if NOT loading, NO error exists, AND viewingRecipe data is present. */}
            {!isLoadingRecipeDetail && !fetchRecipeDetailError && viewingRecipe && (
                // Container for the actual recipe content (header, body, actions).
                <div className="recipe-detail-content">
                    {/* Header section containing the recipe title and ID. */}
                    <div className="recipe-detail-header">
                        {/* Display the recipe title, using 'Untitled Recipe' as a fallback if title is missing. */}
                        <h4>{viewingRecipe.title || 'Untitled Recipe'}</h4>
                        {/* Display the recipe ID within parentheses. */}
                        <span>(ID: {viewingRecipe.id})</span>
                    {/* End of recipe detail header div. */}
                    </div>
                    {/* Main body section containing the image and textual details. */}
                    <div className="recipe-detail-body">
                        {/* Comment indicating the image container section. */}
                        {/* Image Container */}
                        {/* Container specifically for the recipe image in the detail view. */}
                        <div className="recipe-detail-image-container admin-detail-image">
                            {/* The image element itself. */}
                            <img
                                // Set the image source using the getFullImageUrl helper, specifying it's not a profile image.
                                src={getFullImageUrl(viewingRecipe.imageUrl, false)}
                                // Set the alt text for accessibility, using the recipe title or a default fallback.
                                alt={viewingRecipe.title || 'Recipe Image'}
                                // Apply CSS class for styling the detail image.
                                className="recipe-detail-image"
                                // Error handler: If the image fails to load, set onerror to null to prevent infinite loops and set the src to the default food image using the helper.
                                onError={(e) => { e.target.onerror = null; e.target.src = getFullImageUrl(null, false); }} // Use helper for fallback
                                // Enable native browser lazy loading for potentially large images.
                                loading="lazy"
                            />
                        {/* End of the image tag. */}
                        </div>
                        {/* Comment indicating the text details section. */}
                        {/* Text Details */}
                        {/* Container for all the textual information about the recipe. */}
                        <div className="recipe-detail-text">
                             {/* Display the chef's name, using 'N/A' as fallback. */}
                             <p><strong>Chef:</strong> {viewingRecipe.chefName || 'N/A'}</p>
                             {/* Display the recipe type, using 'N/A' as fallback. */}
                             <p><strong>Type:</strong> {viewingRecipe.type || 'N/A'}</p>
                             {/* Display the cuisine type, using 'N/A' as fallback. */}
                             <p><strong>Cuisine:</strong> {viewingRecipe.cuisine || 'N/A'}</p>
                             {/* Display the star rating using the renderStars helper and the numerical rating (formatted to 1 decimal place) if available and greater than 0, otherwise show '(Not Rated)'. */}
                             <p><strong>Rating:</strong> {renderStars(viewingRecipe.averageRating)} {viewingRecipe.averageRating != null && viewingRecipe.averageRating > 0 ? `(${viewingRecipe.averageRating.toFixed(1)}/5)` : '(Not Rated)'}</p>
                             {/* Display the view count, using the nullish coalescing operator to default to 0 if viewCount is null or undefined. */}
                             <p><strong>Views:</strong> {viewingRecipe.viewCount ?? 0}</p> {/* Display View Count */}
                             {/* Commented-out line for displaying status, as recipes might not have a status field in this context. */}
                             {/* <p><strong>Status:</strong> {getStatusText(viewingRecipe.status)}</p> Removed if recipe doesn't have status */}
                             {/* Display the recipe description, using a default message if it's missing. */}
                             <p><strong>Description:</strong> {viewingRecipe.description || 'No description available.'}</p>

                             {/* Section for displaying ingredients. */}
                             <div className="recipe-detail-section">
                                {/* Heading for ingredients with a Font Awesome carrot icon. */}
                                <h5><i className="fas fa-carrot"></i> Ingredients:</h5>
                                {/* Use a <pre> tag to preserve whitespace and line breaks in the ingredients string. */}
                                <pre className="recipe-detail-preformatted">
                                    {/* Display the ingredients string only if it's a string and not empty after trimming whitespace, otherwise show 'Not specified.'. */}
                                    {typeof viewingRecipe.ingredients === 'string' && viewingRecipe.ingredients.trim() ? viewingRecipe.ingredients : 'Not specified.'}
                                </pre>
                             {/* End of ingredients section div. */}
                             </div>

                             {/* Section for displaying instructions. */}
                             <div className="recipe-detail-section">
                                {/* Heading for instructions with a Font Awesome ordered list icon. */}
                                <h5><i className="fas fa-list-ol"></i> Instructions:</h5>
                                {/* Use a <pre> tag to preserve whitespace and line breaks in the instructions string. */}
                                <pre className="recipe-detail-preformatted">
                                    {/* Display the instructions string only if it's a string and not empty after trimming whitespace, otherwise show 'Not specified.'. */}
                                    {typeof viewingRecipe.instructions === 'string' && viewingRecipe.instructions.trim() ? viewingRecipe.instructions : 'Not specified.'}
                               </pre>
                             {/* End of instructions section div. */}
                             </div>
                        {/* End of text details div. */}
                        </div>
                    {/* End of recipe detail body div. */}
                    </div>
                     {/* Comment indicating the actions section specific to the detailed view. */}
                    {/* Action button specific to the detailed view */}
                    {/* Container for action buttons related to the currently viewed recipe. */}
                    <div className="recipe-detail-actions">
                        {/* Button to delete the currently viewed recipe. Calls handleDeleteRecipe with the recipe ID on click. */}
                        <button onClick={() => handleDeleteRecipe(viewingRecipe.id)} className="button-delete">
                            {/* Font Awesome trash icon and text for the delete button. */}
                            <i className="fas fa-trash-alt"></i> Delete This Recipe
                        </button>
                    {/* End of recipe detail actions div. */}
                    </div>
                {/* End of recipe detail content div. */}
                </div>
            // End of the conditional rendering block for recipe content.
            )}
        {/* End of the main recipe detail view div. */}
        </div>
     // End of the return statement for the detail view JSX.
     );
  // Memoization dependencies: This function depends on the recipe data, loading/error states for details, and the close/delete handlers.
  }, [viewingRecipe, isLoadingRecipeDetail, fetchRecipeDetailError, handleCloseRecipeView, handleDeleteRecipe]); // Added handleDeleteRecipe

  // Define a memoized function that determines which content section to render based on the 'activeSection' state.
  const renderSectionContent = useCallback(() => {
       // Priority check: If a recipe detail view is active (data exists), loading, or has an error, render the detail view instead of the list view.
       if (viewingRecipe || isLoadingRecipeDetail || fetchRecipeDetailError) {
         // Call the dedicated function to render the recipe detail view and return its output.
         return renderRecipeDetailView();
       }

      // Use a switch statement on the 'activeSection' state variable to determine the content.
      switch (activeSection) {
            // Case for the 'home' section (Dashboard Overview).
            case 'home': {
                 // Determine the name to display in the welcome message: show '...' while loading, otherwise use the fetched name or default to 'Admin'.
                 const welcomeName = isLoadingAdmin ? '...' : (adminDetails?.name || 'Admin');
                 // Check if there were any errors fetching recipe or review data, as this affects the stats display.
                 const statsHaveError = !!(fetchRecipeError || fetchReviewError);

                 // Determine the text for the total recipes count: '...' while loading, 'N/A' on error, or the actual count. Ensure recipes is an array.
                 let recipesCountText = isLoadingRecipes ? '...' : (fetchRecipeError ? 'N/A' : (Array.isArray(recipes) ? recipes.length.toString() : '0'));
                 // Determine the text for pending reviews count: '...' while loading, 'N/A' on error, or the filtered count. Ensure reviews is an array. Uses getStatusText helper.
                 let pendingReviewsCountText = isLoadingReviews ? '...' : (fetchReviewError ? 'N/A' : (Array.isArray(reviews) ? reviews.filter(r => getStatusText(r.status) === 'Pending').length.toString() : '0'));
                 // Determine the text for approved reviews count: '...' while loading, 'N/A' on error, or the filtered count. Ensure reviews is an array. Uses getStatusText helper.
                 let approvedReviewsCountText = isLoadingReviews ? '...' : (fetchReviewError ? 'N/A' : (Array.isArray(reviews) ? reviews.filter(r => getStatusText(r.status) === 'Approved').length.toString() : '0'));

                 // Return the JSX for the home dashboard overview section.
                 return (
                    // Container div for the admin home overview content.
                    <div className="admin-home-overview">
                        {/* Section heading with a Font Awesome dashboard icon. */}
                        <h3><i className="fas fa-tachometer-alt"></i> Dashboard Overview</h3>
                        {/* Conditionally display an error message if fetching admin details failed. */}
                        {fetchAdminError && <p className="error-message">Error loading admin details: {fetchAdminError}</p>}
                        {/* Personalized welcome message. */}
                        <p>Welcome, {welcomeName}!</p>
                        {/* Informational text guiding the user. */}
                        <p>Manage recipes and reviews using the navigation links.</p>
                        {/* Container for the quick statistics cards. */}
                        <div className="admin-quick-stats">
                            {/* Stat card for total recipes: includes icon, number (or placeholder), label, and an optional error icon with tooltip. */}
                            <div className="stat-card"> <span className="stat-icon"><i className="fas fa-book"></i></span> <span className="stat-number">{recipesCountText}</span> <span className="stat-label">Total Recipes</span> {fetchRecipeError && <span className="stat-error" title={fetchRecipeError}><i className="fas fa-exclamation-triangle"></i></span>} </div>
                            {/* Stat card for pending reviews: includes icon, number (or placeholder), label, and an optional error icon with tooltip. */}
                            <div className="stat-card"> <span className="stat-icon"><i className="fas fa-clock"></i></span> <span className="stat-number">{pendingReviewsCountText}</span> <span className="stat-label">Pending Reviews</span> {fetchReviewError && <span className="stat-error" title={fetchReviewError}><i className="fas fa-exclamation-triangle"></i></span>} </div>
                            {/* Stat card for approved reviews: includes icon, number (or placeholder), label, and an optional error icon with tooltip. */}
                            <div className="stat-card"> <span className="stat-icon"><i className="fas fa-check-circle"></i></span> <span className="stat-number">{approvedReviewsCountText}</span> <span className="stat-label">Approved Reviews</span> {fetchReviewError && <span className="stat-error" title={fetchReviewError}><i className="fas fa-exclamation-triangle"></i></span>} </div>
                        {/* End of the quick stats container div. */}
                        </div>
                        {/* Conditionally display a subtle message if stats might be inaccurate due to loading errors (and loading is finished). */}
                        {statsHaveError && !isLoadingRecipes && !isLoadingReviews && <p className="error-message info-subtle">Some statistics might be unavailable due to data loading errors.</p>}
                    {/* End of the admin home overview container div. */}
                    </div>
                 // End of the return statement for the home case.
                 );
            // End of the 'home' case block.
            }

            // Case for the 'recipes' section (Manage All Recipes).
            case 'recipes': {
                // Return the JSX for the recipe management section.
                return (
                    // Use a React Fragment <>...</> because we have multiple top-level elements (heading, messages, list).
                    <>
                        {/* Section heading with a Font Awesome utensils icon. */}
                        <h3><i className="fas fa-utensils"></i> Manage All Recipes</h3>
                        {/* Conditional rendering: Display a loading message if recipes are currently being fetched. */}
                        {isLoadingRecipes && <p className="loading-message"><i className="fas fa-spinner fa-spin"></i> Loading recipes...</p>}
                        {/* Conditional rendering: Display an error message if fetching recipes failed. */}
                        {fetchRecipeError && <p className="error-message">Error loading recipes: {fetchRecipeError}</p>}
                        {/* Conditional rendering: Display an info message if loading is finished, there are no errors, but the recipes array is empty. */}
                        {!isLoadingRecipes && !fetchRecipeError && recipes.length === 0 && <p className="info-message">No recipes found.</p>}
                        {/* Conditional rendering: Display the list of recipes only if loading is finished, no errors occurred, and there are recipes in the array. */}
                        {!isLoadingRecipes && !fetchRecipeError && recipes.length > 0 && (
                            // Container div for the list of recipe cards with specific admin styling.
                            <div className="recipe-list admin-recipe-list">
                                {/* Map over the 'recipes' array. For each 'recipe' object, render a recipe card. */}
                                {recipes.map((recipe) => (
                                    // Individual recipe card container. Use the unique 'recipe.id' as the key for efficient rendering.
                                    <div key={recipe.id} className="recipe-card admin-recipe-card">
                                        {/* Container specifically for the image within the admin recipe card layout. */}
                                        <div className="admin-recipe-image-container">
                                            {/* The image element for the recipe. */}
                                            <img
                                                // Set the image source using the helper function.
                                                src={getFullImageUrl(recipe.imageUrl, false)}
                                                // Set the alt text for accessibility.
                                                alt={recipe.title || 'Recipe Image'}
                                                // Apply CSS class for styling.
                                                className="recipe-image"
                                                // Set the fallback image source if the primary image fails to load.
                                                onError={(e) => { e.target.onerror = null; e.target.src = getFullImageUrl(null, false); }}
                                                // Enable native browser lazy loading.
                                                loading="lazy"
                                            />
                                            {/* An optional placeholder div that can be styled to show when no image is available or fails to load. */}
                                            <div className="admin-recipe-image-placeholder"><span>No Image</span></div>
                                        {/* End of the admin image container div. */}
                                        </div>
                                        {/* Container for the textual content and action buttons of the recipe card. */}
                                        <div className="admin-recipe-content-container">
                                            {/* Display the recipe title, with a fallback. */}
                                            <h4>{recipe.title || 'Untitled Recipe'}</h4>
                                            {/* Display the recipe ID. */}
                                            <p><strong>ID:</strong> {recipe.id}</p>
                                            {/* Display the chef's name, with a fallback. */}
                                            <p><strong>Chef:</strong> {recipe.chefName || 'N/A'}</p>
                                            {/* Display the recipe type, with a fallback. */}
                                            <p><strong>Type:</strong> {recipe.type || 'N/A'}</p>
                                            {/* Display the star rating using the helper and the numerical rating (formatted) if available, otherwise '(N/A)'. */}
                                            <p><strong>Rating:</strong> {renderStars(recipe.averageRating)} {recipe.averageRating != null && recipe.averageRating > 0 ? `(${recipe.averageRating.toFixed(1)})` : '(N/A)'}</p>
                                            {/* Comment indicating that recipe status is likely not displayed in the list view for admins. */}
                                            {/* Status removed if not applicable */}
                                            {/* Display the view count, defaulting to 0 if null/undefined. */}
                                            <p><strong>Views:</strong> {recipe.viewCount ?? 0}</p>
                                            {/* Container for the action buttons on this recipe card. */}
                                            <div className="recipe-actions">
                                                {/* Button to view the details of this recipe. Calls handleViewRecipe with the recipe ID on click. */}
                                                <button onClick={() => handleViewRecipe(recipe.id)} className="button-view">
                                                    {/* Font Awesome eye icon and text for the view button. */}
                                                    <i className="fas fa-eye"></i> View
                                                </button>
                                                {/* Button to delete this recipe. Calls handleDeleteRecipe with the recipe ID on click. */}
                                                <button onClick={() => handleDeleteRecipe(recipe.id)} className="button-delete">
                                                    {/* Font Awesome trash icon and text for the delete button. */}
                                                    <i className="fas fa-trash-alt"></i> Delete
                                                </button>
                                            {/* End of the recipe actions container div. */}
                                            </div>
                                        {/* End of the admin recipe content container div. */}
                                        </div>
                                    {/* End of the individual recipe card div. */}
                                    </div>
                                // End of the mapping function for each recipe.
                                ))}
                            {/* End of the recipe list container div. */}
                            </div>
                        // End of the conditional rendering block for the recipe list.
                        )}
                    {/* End of the React Fragment. */}
                    </>
                // End of the return statement for the recipes case.
                );
            // End of the 'recipes' case block.
            }

            // Case for the 'reviews' section (Manage Public Reviews).
            case 'reviews': {
                 // Pre-process the reviews array: Create a new array 'adjustedReviews' where each review object has an added 'statusText' property.
                 // Use optional chaining `reviews || []` to safely handle cases where `reviews` might be null or undefined before mapping.
                 const adjustedReviews = (reviews || []).map(review => ({
                    // Spread all original properties from the 'review' object.
                    ...review,
                    // Add a new property 'statusText' by calling the getStatusText helper with the review's status.
                    statusText: getStatusText(review.status)
                 // End of the object definition for the mapped review.
                 }));

                 // Return the JSX for the review management section.
                 return (
                      // Use a React Fragment as the root element.
                      <>
                         {/* Section heading with a Font Awesome comments icon. */}
                         <h3><i className="fas fa-comments"></i> Manage Public Reviews</h3>
                         {/* Conditional rendering: Display a loading message if reviews are currently being fetched. */}
                         {isLoadingReviews && <p className="loading-message"><i className="fas fa-spinner fa-spin"></i> Loading reviews...</p>}
                         {/* Conditional rendering: Display an error message if fetching reviews failed. */}
                         {fetchReviewError && <p className="error-message">Error loading reviews: {fetchReviewError}</p>}
                         {/* Conditional rendering: Display an info message if loading is finished, no errors, but the adjustedReviews array is empty. */}
                         {!isLoadingReviews && !fetchReviewError && adjustedReviews.length === 0 && <p className="info-message">No reviews found.</p>}
                         {/* Conditional rendering: Display the list of reviews only if loading is done, no errors occurred, and there are reviews in the adjustedReviews array. */}
                         {!isLoadingReviews && !fetchReviewError && adjustedReviews.length > 0 && (
                            // Container div for the list of review cards with specific admin styling.
                            <div className="review-list admin-review-list">
                               {/* Map over the 'adjustedReviews' array. For each 'review' object, render a review card. */}
                               {adjustedReviews.map((review) => (
                                 // Individual review card container. Use the unique 'review.id' as the key.
                                 <div key={review.id} className="review-card admin-review-card">
                                     {/* Display the review ID. */}
                                     <p><strong>Review ID:</strong> {review.id}</p>
                                     {/* Comment indicating the purpose of the next block: linking to the associated recipe. */}
                                     {/* Link to view the recipe the review is for */}
                                     {/* Conditional rendering: Only display the recipe link/button if the review object has a 'recipeId'. */}
                                     {review.recipeId && (
                                        // Paragraph containing the link/button to the recipe.
                                        <p><strong>Recipe:</strong> #{review.recipeId} -
                                            {/* A button styled like a link (via CSS class 'button-link-styled') that triggers the recipe detail view when clicked. */}
                                            <button onClick={() => handleViewRecipe(review.recipeId)} className="button-link-styled">
                                                {/* Text for the button. */}
                                                View Recipe
                                            </button>
                                        </p>
                                     // End of the conditional rendering block for the recipe link.
                                     )}
                                     {/* Display the submission date/time. Format it using toLocaleString() if available, otherwise show 'N/A'. */}
                                     <p><strong>Submitted:</strong> {review.submittedAt ? new Date(review.submittedAt).toLocaleString() : 'N/A'}</p>
                                     {/* Container for the rating display. */}
                                     <div className="review-rating">
                                         {/* Display the label, the star rating using the helper, and the numerical rating value. */}
                                         <strong>Rating:</strong> {renderStars(review.ratingValue)} ({review.ratingValue}/5)
                                     {/* End of the rating container div. */}
                                     </div>
                                     {/* Display the review comment text. Use an italicized fallback message if the text is empty or missing. */}
                                     <p className="review-text"><strong>Comment:</strong> {review.reviewText || <i>(No text provided)</i>}</p>
                                     {/* Display the review status using the pre-calculated 'statusText'. Apply dynamic CSS classes for status-specific styling (e.g., 'status-pending', 'status-approved'). */}
                                     <p><strong>Status:</strong> <span className={`status-badge status-${review.statusText.toLowerCase()}`}>{review.statusText}</span></p>
                                     {/* Container for the action buttons related to this review. */}
                                     <div className="review-actions">
                                         {/* Conditional rendering: Show the 'Approve' button only if the review's status is not already 'Approved'. */}
                                         {review.statusText !== 'Approved' && (
                                            // Button to approve the review. Calls handleUpdateReviewStatus with the review ID and status code 1 (Approved).
                                            <button onClick={() => handleUpdateReviewStatus(review.id, 1)} className="button-approve"> <i className="fas fa-check"></i> Approve </button>
                                         // End of conditional rendering for the approve button.
                                         )}
                                         {/* Conditional rendering: Show the 'Reject' button only if the review's status is not already 'Rejected'. */}
                                         {review.statusText !== 'Rejected' && (
                                            // Button to reject the review. Calls handleUpdateReviewStatus with the review ID and status code 2 (Rejected).
                                            <button onClick={() => handleUpdateReviewStatus(review.id, 2)} className="button-reject"> <i className="fas fa-times"></i> Reject </button>
                                         // End of conditional rendering for the reject button.
                                         )}
                                         {/* Button to permanently delete the review. Calls handleDeleteReview with the review ID. */}
                                         <button onClick={() => handleDeleteReview(review.id)} className="button-delete"> <i className="fas fa-trash-alt"></i> Delete </button>
                                     {/* End of the review actions container div. */}
                                     </div>
                                 {/* End of the individual review card div. */}
                                </div>
                              // End of the mapping function for each review.
                              ))}
                            {/* End of the review list container div. */}
                            </div>
                          // End of the conditional rendering block for the review list.
                          )}
                      {/* End of the React Fragment. */}
                      </>
                 // End of the return statement for the reviews case.
                 );
            // End of the 'reviews' case block.
            }
             // Default case for the switch statement, handles unexpected values of 'activeSection'.
             default:
                // Log a warning to the console indicating an invalid section state was encountered.
                console.warn("Invalid activeSection:", activeSection);
                // Avoid setting state directly within the render function as it can cause infinite loops.
                // setActiveSection('home'); // Avoid direct state set in render
                // Return a simple fallback paragraph indicating an error.
                return <p>Invalid section selected.</p>; // Fallback UI
         // End of the switch statement.
         }
  // Memoization dependency array for the renderSectionContent function.
  // It needs to be re-created if any of the state variables it reads or the handler functions it calls change.
  }, [
      // State related to the active section and admin details (used in 'home').
      activeSection, adminDetails, isLoadingAdmin, fetchAdminError,
      // State related to the recipes list (used in 'home' stats and 'recipes' list/detail).
      recipes, isLoadingRecipes, fetchRecipeError,
      // State related to the reviews list (used in 'home' stats and 'reviews' list).
      reviews, isLoadingReviews, fetchReviewError,
      // State related to the recipe detail view (used for override logic and in detail view itself).
      viewingRecipe, isLoadingRecipeDetail, fetchRecipeDetailError,
      // Handler functions called by buttons within the rendered content.
      handleViewRecipe, handleDeleteRecipe, handleUpdateReviewStatus, handleDeleteReview,
      // The function that renders the detail view, included as a dependency because renderSectionContent calls it.
      renderRecipeDetailView // Include the detail view renderer function
  // End of the dependency array.
  ]);

  // --- Component Return (JSX Structure) ---
  // The main return statement defining the component's output UI structure.
  return (
    // Use a React Fragment <>...</> as the top-level wrapper, allowing multiple adjacent elements (nav, div).
    <>
      {/* Navigation bar container with specific admin dashboard styling. */}
      <nav className="admin-dashboard-navbar">
        {/* Container for the brand/logo area of the navbar. */}
        <div className="navbar-brand">
          {/* Use the Link component from react-router-dom for client-side navigation.
              Set 'to' to '#' and use onClick to handle navigation to prevent full page reload.
              preventDefault stops the default '#' link behavior.
              Use handleNavClick to switch the active section to 'home'.
              Add aria-label for accessibility. */}
          <Link to="#" onClick={(e) => {e.preventDefault(); handleNavClick('home');}} aria-label="Go to admin dashboard home">
             {/* Font Awesome shield icon representing the admin panel. */}
             <i className="fas fa-shield-alt"></i> Admin Panel
          {/* End of the Link component. */}
          </Link>
        {/* End of the navbar brand container. */}
        </div>
        {/* Container for the main navigation action buttons. */}
        <div className="navbar-actions">
          {/* Button for navigating to the 'Home' section. Calls handleNavClick('home').
              Dynamically adds the 'active' class if the activeSection state is 'home'. */}
          <button onClick={() => handleNavClick('home')} className={`navbar-button ${activeSection === 'home' ? 'active' : ''}`}> <i className="fas fa-home"></i> Home </button>
          {/* Comment explaining the slightly different logic for the 'Recipes' button's active state. */}
          {/* Updated recipes button logic to handle detail view */}
          {/* Button for navigating to the 'Recipes' section. Calls handleNavClick('recipes').
              Dynamically adds the 'active' class if activeSection is 'recipes' OR if a recipe detail is currently being viewed (viewingRecipe is truthy). */}
          <button onClick={() => handleNavClick('recipes')} className={`navbar-button ${(activeSection === 'recipes' || viewingRecipe) ? 'active' : ''}`}> <i className="fas fa-book"></i> Recipes </button>
          {/* Button for navigating to the 'Reviews' section. Calls handleNavClick('reviews').
              Dynamically adds the 'active' class if activeSection is 'reviews'. */}
          <button onClick={() => handleNavClick('reviews')} className={`navbar-button ${activeSection === 'reviews' ? 'active' : ''}`}> <i className="fas fa-comments"></i> Reviews </button>
          {/* Button to trigger the logout process. Calls the handleLogout function on click. */}
          <button onClick={handleLogout} className="navbar-button logout-button"> <i className="fas fa-sign-out-alt"></i> Logout </button>
        {/* End of the navbar actions container. */}
        </div>
      {/* End of the navigation bar. */}
      </nav>

      {/* Main content area container below the navbar, with specific admin dashboard styling. */}
      <div className="dashboard-content admin-dashboard-content">
          {/* Comment explaining the purpose of the following conditional error message. */}
          {/* Display general loading error outside of detail view */}
          {/* Conditionally render a general error message if:
              1. We are NOT currently viewing a recpe detail (or loading one).
              2. AND there was an error fetching admin details OR recipes OR reviews. */}
          {!viewingRecipe && !isLoadingRecipeDetail && (fetchAdminError || fetchRecipeError || fetchReviewError) &&
             // Display a dashboard-wide error message indicating potential data loading issues.
             <p className="error-message dashboard-wide-error">Could not load all dashboard data. Some sections may be unavailable.</p>
          }
          {/* Call the renderSectionContent function to render the appropriate content based on the current state (activeSection or recipe detail view). */}
          {renderSectionContent()}
      {/* End of the main dashboard content container. */}
      </div>
    {/* End of the root React Fragment. */}
    </>
  // End of the main component's return statement.
  );
// End of the AdmindashboardComponent functional component definition.
};

// Export the AdmindashboardComponent as the default export of this module, making it available for import in other files.
export default AdmindashboardComponent;