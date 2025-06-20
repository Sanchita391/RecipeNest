// Import React library and the useState hook for managing component state.
import React, { useState } from "react";
// Import Link for declarative navigation and useNavigate hook for programmatic navigation.
import { Link, useNavigate } from "react-router-dom";
// Import the CSS file for styling the authentication components.
import "../CSS/Auth.css"; // Make sure this CSS file exists and is correct

// Define the base URL constant for the backend API.
const API_BASE_URL = "https://localhost:7092";

// Define the functional component for the Login page.
const LoginComponent = () => {
  // State variable to store the user's email input. Initialized to an empty string.
  const [email, setEmail] = useState("");
  // State variable to store the user's password input. Initialized to an empty string.
  const [password, setPassword] = useState("");
  // State variable to store any error messages during login. Initialized to an empty string.
  const [error, setError] = useState(""); // State for error messages
  // State variable to indicate if a login request is in progress. Initialized to false.
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  // Get the navigate function from react-router-dom to redirect the user programmatically.
  const navigate = useNavigate();

  // Define an asynchronous function to handle the login form submission.
  const handleLogin = async (e) => {
    // Prevent the default form submission behavior which causes a page reload.
    e.preventDefault();
    // Clear any previous error messages before starting a new login attempt.
    setError(""); // Clear previous errors
    // Set the loading state to true to indicate the login process has started (e.g., disable button).
    setIsLoading(true);

    // Start a try block to handle potential errors during the API call.
    try {
      // Make an asynchronous POST request to the login API endpoint.
      const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        // Specify the HTTP method as POST.
        method: "POST",
        // Set the request headers.
        headers: {
          // Indicate that the request body contains JSON data.
          "Content-Type": "application/json",
          // Indicate that the client accepts JSON responses. Good practice.
          "Accept": "application/json", // Good practice to include Accept header
        },
        // Convert the email and password state variables into a JSON string for the request body.
        body: JSON.stringify({ email, password }),
      });

      // Initialize a variable to hold the parsed response data.
      let responseData = null;
      // Start a nested try block to safely parse the response body as JSON.
      try {
         // Get the 'Content-Type' header from the response.
         const contentType = res.headers.get("content-type");
         // Check if the content type header exists and indicates JSON format.
         if (contentType && contentType.includes("application/json")) {
             // If it's JSON, parse the response body.
             responseData = await res.json();
         // If the response is not JSON.
         } else {
             // Read the response body as text for debugging purposes.
             const textResponse = await res.text();
             // Log a warning indicating a non-JSON response was received.
             console.warn("Received non-JSON response:", textResponse);
         }
      // Catch any errors that occur during JSON parsing.
      } catch (jsonError) {
         // Log an error if parsing the JSON response fails.
         console.error("Failed to parse JSON response:", jsonError);
         // Comment indicating that the code might proceed to check res.ok despite parsing failure.
         // You might still want to proceed to check res.ok and status code
      }

      // Comment indicating the start of the login failure handling block.
      // --- Handle Login Failure ---
      // Check if the response status code indicates failure (not in the 200-299 range).
      if (!res.ok) {
        // Initialize a default error message with the response status.
        let specificError = `Login failed. Status: ${res.status}`; // Default error

        // Comment indicating the start of the specific error message logic.
        // *** START: Specific Error Message Logic ***
        // Check if the status code is 404 (Not Found).
        if (res.status === 404) {
            // Assume 404 means the user associated with the email was not found.
            specificError = "User with this email does not exist.";
        // Check if the status code is 400 (Bad Request) or 401 (Unauthorized).
        } else if (res.status === 400 || res.status === 401) {
            // Assume 400/401 mean invalid credentials (password mismatch or invalid email format).
            // For security, use a generic message without revealing which part (email or password) was incorrect.
            specificError = "Invalid email or password.";
             // Comment about optionally using a specific backend message if available, but recommending the general message for security.
             // OPTIONAL: If your backend *specifically* sends a clear message for invalid password
             // even on 400/401, you *could* use it, but the general message is often safer.
             // if (responseData?.message) { specificError = responseData.message; }
        // Check if there's a message property in the parsed response data (for other errors like 500).
         } else if (responseData?.message) {
            // Use the specific error message provided by the backend if available.
             specificError = responseData.message;
         }
        // Comment indicating the end of the specific error message logic.
        // *** END: Specific Error Message Logic ***

        // Log the detailed error information to the console for debugging.
        console.error("Login Error:", specificError, "| Status:", res.status, "| Response Body:", responseData);
        // Set the error state to display the specific error message to the user.
        setError(specificError);
        // Set the loading state back to false as the login attempt has failed.
        setIsLoading(false);
        // Exit the handleLogin function early.
        return;
      }

      // Comment indicating the start of the successful login handling block.
      // --- Login Successful ---

      // Double-check that responseData is not null or undefined even after a successful response (2xx).
      if (!responseData) {
         // Log an error if the response body is missing after a successful login status.
         console.error("Login Success but missing response body:", responseData);
         // Set an error message indicating a problem with the server's response.
         setError("Login successful, but couldn't read server response.");
         // Set loading state back to false.
         setIsLoading(false);
         // Exit the function.
         return;
      }

      // Comment indicating enhanced data validation section.
      // **Enhanced Data Validation**
      // Check if essential data (token, user object, user role) is present and valid in the response.
      if (!responseData.token || !responseData.user || typeof responseData.user.role !== 'string' || responseData.user.role.trim() === '') {
        // Log an error if the successful response is missing required data or has an invalid role format.
        console.error("Login Success Response Missing Data or Invalid Role:", responseData);
        // Set an error message indicating incomplete data received from the server.
        setError("Login succeeded but received incomplete user data from server.");
        // Set loading state back to false.
        setIsLoading(false);
        // Exit the function.
        return;
      }

      // Extract the authentication token from the response data.
      const token = responseData.token;
      // Extract the user's role from the nested user object in the response data.
      const userRole = responseData.user.role;
      // Extract the user's first name from the response data, providing "User" as a fallback.
      const userName = responseData.user.firstName || "User";

      // Log the received user role for confirmation/debugging.
      console.log("Login Success - Received User Role:", userRole);
      // Log the entire user object received from the API for detailed debugging.
      console.log("Full API Response User Object:", responseData.user);

      // Store the authentication token in the browser's local storage.
      localStorage.setItem("token", token);
      // Store the user's role in the browser's local storage.
      localStorage.setItem("role", userRole);

      // Display a personalized welcome message to the user using a browser alert.
      alert(`Welcome ${userName} to your RecipeNest dashboard!`);

      // Set the loading state back to false *before* navigating away.
      setIsLoading(false); // Set loading to false *before* navigating

      // Redirect the user to the appropriate dashboard based on their role.
      switch (userRole) {
        // If the role is "Chef", navigate to the chef dashboard.
        case "Chef": navigate("/chef-dashboard"); break;
        // If the role is "Admin", navigate to the admin dashboard.
        case "Admin": navigate("/admin-dashboard"); break;
        // If the role is "FoodLover", navigate to the food lover dashboard.
        case "FoodLover": navigate("/foodlover-dashboard"); break;
        // Handle cases where the role is unknown or unexpected.
        default:
          // Log a warning about the unknown role.
          console.warn("Unknown user role received:", userRole, ". Redirecting to fallback (/).");
          // Set an error message indicating the issue.
          setError(`Login successful, but received an unknown role ('${userRole}'). Redirecting to homepage.`);
          // Navigate the user to the homepage as a fallback.
          navigate("/");
          // Exit the switch statement.
          break;
      }
    // Catch any errors that occurred outside the fetch promise chain (e.g., network errors).
    } catch (err) {
      // Log the caught error to the console.
      console.error("Login fetch/network error:", err);
      // Check if the error is not an AbortError (which can happen if the request is cancelled).
      if (err.name !== 'AbortError') {
         // Set a generic error message indicating a network or server connection issue.
         setError("Login failed. Could not connect to the server. Please check your network or try again later.");
      }
      // Set the loading state back to false as the login attempt failed.
      setIsLoading(false);
    }
  // Close the handleLogin function definition.
  };

  // Comment indicating the start of the JSX structure, noting no changes needed.
  // --- JSX Structure (No changes needed here) ---
  // Return the JSX structure that defines the component's UI.
  return (
    // Main container div for the authentication page layout.
    <div className="auth-container">
      {/* A rectangle div likely used for background or layout structure. */}
      <div className="rectangle">
        {/* Div likely used for a background image element. */}
        <div className="hero-image"></div>
        {/* Div likely used for a color overlay on the background image. */}
        <div className="overlay"></div>
        {/* Container div for the actual login form box. */}
        <div className="auth-box">
          {/* Heading text for the login box. */}
          <h2>Welcome Back!</h2>
          {/* The login form element, triggering handleLogin on submission. */}
          <form onSubmit={handleLogin}>
            {/* Comment indicating the error display area. */}
            {/* Error Display */}
            {/* Conditional rendering: Display the error message paragraph only if the 'error' state is not empty. */}
            {error && (
              // Paragraph element to display the error message, with inline styles for visibility.
              <p className="error-msg" style={{ color: 'red', backgroundColor: '#ffebee', border: '1px solid #e57373', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>
                {/* Display the error message text from the state. */}
                {error}
              </p>
            )}

            {/* Comment indicating the Email Input section. */}
            {/* Email Input */}
            {/* Container div grouping the label and input for email. */}
            <div className="input-group">
              {/* Label for the email input field, linked by htmlFor to the input's id. */}
              <label htmlFor="login-email">Email Address</label>
              {/* Email input field. */}
              <input
                // ID attribute, matching the label's htmlFor.
                id="login-email"
                // Input type set to "email" for basic browser validation.
                type="email"
                // Placeholder text displayed when the input is empty.
                placeholder="Enter your email"
                // Bind the input's value to the 'email' state variable.
                value={email}
                // Update the 'email' state variable whenever the input value changes.
                onChange={(e) => setEmail(e.target.value)}
                // Mark the input as required for form submission.
                required
                // ARIA attribute linking the input to potential error messages (optional).
                aria-describedby="email-error" // For accessibility, add error element if needed
              />
              {/* Comment indicating an optional element for displaying specific input errors. */}
               {/* Optional: Add <span id="email-error" className="input-error"></span> */}
            {/* Close the email input-group div. */}
            </div>

            {/* Comment indicating the Password Input section. */}
            {/* Password Input */}
            {/* Container div grouping the label and input for password. */}
            <div className="input-group">
              {/* Label for the password input field. */}
              <label htmlFor="login-password">Password</label>
              {/* Password input field. */}
              <input
                // ID attribute, matching the label's htmlFor.
                id="login-password"
                // Input type set to "password" to mask the characters.
                type="password"
                // Placeholder text.
                placeholder="Enter your password"
                // Bind the input's value to the 'password' state variable.
                value={password}
                // Update the 'password' state variable on change.
                onChange={(e) => setPassword(e.target.value)}
                // Mark the input as required.
                required
                // ARIA attribute linking to potential error messages.
                aria-describedby="password-error" // For accessibility
              />
              {/* Comment indicating an optional element for displaying specific input errors. */}
               {/* Optional: Add <span id="password-error" className="input-error"></span> */}
            {/* Close the password input-group div. */}
            </div>

            {/* Submit button for the login form. */}
            <button type="submit" className="btn-auth" disabled={isLoading}>
              {/* Dynamically change the button text based on the 'isLoading' state. */}
              {isLoading ? "Logging In..." : "Login"}
            {/* Close the submit button. */}
            </button>

            {/* Paragraph containing a link to the signup page. */}
            <p className="auth-switch-link">
              {/* Text preceding the link. */}
              Don't have an account? {/* Link component for navigating to the signup route. */}
              <Link to="/signup">Sign up Here</Link>
            {/* Close the paragraph. */}
            </p>
            {/* Paragraph containing a link back to the homepage. */}
            <p className="auth-switch-link">
              {/* Link component for navigating back to the root route. */}
              <Link to="/">← Back to Homepage</Link>
            {/* Close the paragraph. */}
            </p>
          {/* Close the form element. */}
          </form>
        {/* Close the auth-box div. */}
        </div>
      {/* Close the rectangle div. */}
      </div>
    {/* Close the main auth-container div. */}
    </div>
  );
// Close the LoginComponent definition.
};

// Export the LoginComponent as the default export of this module.
export default LoginComponent;