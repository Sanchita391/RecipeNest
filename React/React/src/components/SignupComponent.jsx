// Import React library and the useState hook for managing component state.
import React, { useState } from "react";
// Import Link for declarative navigation and useNavigate hook for programmatic navigation from react-router-dom.
import { Link, useNavigate } from "react-router-dom";
// Import the CSS file associated with authentication components for styling.
import "../CSS/Auth.css";

// Define the base URL constant for the backend API endpoint.
const API_BASE_URL = "https://localhost:7092";

// Define the functional component for the Signup page.
const SignupComponent = () => {
  // Declare a state variable 'formData' to hold the values of the signup form fields.
  // Initialized with default values for each field.
  const [formData, setFormData] = useState({
    // Field for the user's full name.
    name: "",
    // Field for the user's email address.
    email: "",
    // Field for the user's chosen password.
    password: "",
    // Field for selecting the user's role (defaults to "Chef").
    role: "Chef",
    // Field for the Chef's specific role title (e.g., Head Chef).
    roleTitle: "",
    // Field for the Chef's culinary specialty (e.g., Italian Cuisine).
    specialty: ""
  });

  // Declare a state variable 'error' to store any error messages during signup. Initialized as an empty string.
  const [error, setError] = useState("");
  // Declare a state variable 'isLoading' to indicate if a signup request is in progress. Initialized to false.
  const [isLoading, setIsLoading] = useState(false);
  // Get the navigate function from react-router-dom to redirect the user programmatically after signup.
  const navigate = useNavigate();

  // Define a function to handle changes in any of the form input fields.
  const handleChange = (e) => {
    // Destructure the 'name' and 'value' properties from the event target (the input field that changed).
    const { name, value } = e.target;
    // Update the 'formData' state using the previous state.
    // Spread the previous state (...prev) and update the specific field ([name]) with the new value.
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check if the changed field was the 'role' select and its new value is "FoodLover".
    if (name === "role" && value === "FoodLover") {
      // If the role is changed to "FoodLover", clear the Chef-specific fields (roleTitle and specialty).
      setFormData((prev) => ({ ...prev, roleTitle: "", specialty: "" }));
    }
  };

  // Define an asynchronous function to handle the signup form submission.
  const handleSignup = async (e) => {
    // Prevent the default form submission behavior (which would cause a page reload).
    e.preventDefault();
    // Clear any previous error messages before starting a new signup attempt.
    setError("");
    // Set the loading state to true to indicate the signup process has started.
    setIsLoading(true);

    // Construct the full URL for the signup API endpoint.
    const endpoint = `${API_BASE_URL}/api/Auth/signup`;

    // Construct the payload object to be sent in the request body.
    const payload = {
      // Include name, email, password, and role from the formData state.
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      // Conditionally include roleTitle only if the selected role is "Chef".
      ...(formData.role === "Chef" && { roleTitle: formData.roleTitle }),
      // Conditionally include specialty only if the selected role is "Chef".
      ...(formData.role === "Chef" && { specialty: formData.specialty })
    };

    // Add specific validation for Chef role: roleTitle and specialty are required.
    if (formData.role === "Chef" && (!formData.roleTitle || !formData.specialty)) {
      // If validation fails, set an error message.
      setError("Role Title and Specialty are required for Chefs.");
      // Set loading state back to false.
      setIsLoading(false);
      // Exit the function early.
      return;
    }

    // Start a try block to handle potential errors during the API call.
    try {
      // Make an asynchronous POST request to the signup endpoint.
      const res = await fetch(endpoint, {
        // Specify the HTTP method as POST.
        method: "POST",
        // Set the 'Content-Type' header to indicate JSON data is being sent.
        headers: { "Content-Type": "application/json" },
        // Convert the payload JavaScript object into a JSON string for the request body.
        body: JSON.stringify(payload)
      });

      // Check if the response status code indicates failure (not OK).
      if (!res.ok) {
        // Attempt to parse the error response body as JSON. Use a catch block for cases where parsing fails (e.g., non-JSON response).
        const errData = await res.json().catch(() => ({ message: `Signup failed with status: ${res.status}` }));
        // Set the error state with the message from the parsed error data or a generic fallback message.
        setError(errData.message || "Signup failed. Please try again.");
        // Set loading state back to false as the signup attempt failed.
        setIsLoading(false);
        // Exit the function early.
        return;
      }

      // If the signup was successful (response status is OK).
      // Show a success message to the user using a browser alert.
      alert("Signup successful! Please log in.");
      // Navigate the user programmatically to the login page.
      navigate("/login");

    // Catch any errors that occurred during the try block (e.g., network errors, server unavailable).
    } catch (err) {
      // Log the detailed error object to the console for debugging.
      console.error("Signup fetch error:", err);
      // Set a generic error message indicating a network or server issue.
      setError("Network error or server unavailable. Please try again later.");
      // Set the loading state back to false as the signup attempt failed.
      setIsLoading(false);
    }
  };

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

        {/* Container div for the actual signup form box. */}
        <div className="auth-box">
          {/* Heading text for the signup box. */}
          <h2>Create Your Account</h2>
          {/* The signup form element, triggering handleSignup on submission. */}
          <form onSubmit={handleSignup}>
            {/* Conditional rendering: Display the error message paragraph only if the 'error' state is not empty. Apply inline styles. */}
            {error && <p className="error-msg" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

            {/* Input group for selecting the user role (moved to the top). */}
            <div className="input-group">
              {/* Label for the role selection dropdown. */}
              <label htmlFor="signup-role">Register As</label>
              {/* Select dropdown element for choosing the role. */}
              <select id="signup-role" name="role" value={formData.role} onChange={handleChange}>
                {/* Option for selecting "Chef". */}
                <option value="Chef">Chef</option>
                {/* Option for selecting "FoodLover". */}
                <option value="FoodLover">Food Lover</option>
              {/* Close the select element. */}
              </select>
            {/* Close the role input group div. */}
            </div>

            {/* Input group for the user's full name. */}
            <div className="input-group">
              {/* Label for the name input field. */}
              <label htmlFor="signup-name">Full Name</label>
              {/* Text input field for the name. */}
              <input
                // ID attribute matching the label's htmlFor.
                id="signup-name"
                // Input type set to "text".
                type="text"
                // Name attribute corresponding to the key in the formData state.
                name="name"
                // Placeholder text.
                placeholder="Enter your full name"
                // Bind the input's value to the 'name' field in formData state.
                value={formData.name}
                // Attach the handleChange function to handle input changes.
                onChange={handleChange}
                // Mark the input as required for form submission.
                required
              />
            {/* Close the name input group div. */}
            </div>

            {/* Input group for the user's email address. */}
            <div className="input-group">
              {/* Label for the email input field. */}
              <label htmlFor="signup-email">Email Address</label>
              {/* Email input field. */}
              <input
                // ID attribute.
                id="signup-email"
                // Input type set to "email" for basic browser validation.
                type="email"
                // Name attribute.
                name="email"
                // Placeholder text.
                placeholder="Enter your email"
                // Bind value to formData state.
                value={formData.email}
                // Handle changes with handleChange.
                onChange={handleChange}
                // Mark as required.
                required
              />
            {/* Close the email input group div. */}
            </div>

            {/* Input group for the user's password. */}
            <div className="input-group">
              {/* Label for the password input field. */}
              <label htmlFor="signup-password">Password</label>
              {/* Password input field. */}
              <input
                // ID attribute.
                id="signup-password"
                // Input type set to "password" to mask characters.
                type="password"
                // Name attribute.
                name="password"
                // Placeholder text.
                placeholder="Choose a strong password"
                // Bind value to formData state.
                value={formData.password}
                // Handle changes with handleChange.
                onChange={handleChange}
                // Mark as required.
                required
              />
            {/* Close the password input group div. */}
            </div>

            {/* Conditional rendering: Display Chef-specific fields only if the selected role is "Chef". */}
            {formData.role === "Chef" && (
              // React Fragment (<>) to group multiple elements without adding an extra node to the DOM.
              <>
                {/* Input group for the Chef's role title. */}
                <div className="input-group">
                  {/* Label for the role title input. */}
                  <label htmlFor="signup-roletitle">Role Title</label>
                  {/* Text input field for role title. */}
                  <input
                    // ID attribute.
                    id="signup-roletitle"
                    // Input type text.
                    type="text"
                    // Name attribute.
                    name="roleTitle"
                    // Placeholder text providing examples.
                    placeholder="e.g., Head Chef, Pastry Chef"
                    // Bind value to formData state.
                    value={formData.roleTitle}
                    // Handle changes with handleChange.
                    onChange={handleChange}
                    // Mark as required (since it's conditionally rendered for Chefs).
                    required
                  />
                {/* Close the role title input group div. */}
                </div>

                {/* Input group for the Chef's specialty. */}
                <div className="input-group">
                  {/* Label for the specialty input. */}
                  <label htmlFor="signup-specialty">Specialty</label>
                  {/* Text input field for specialty. */}
                  <input
                    // ID attribute.
                    id="signup-specialty"
                    // Input type text.
                    type="text"
                    // Name attribute.
                    name="specialty"
                    // Placeholder text providing examples.
                    placeholder="e.g., Italian Cuisine, Baking"
                    // Bind value to formData state.
                    value={formData.specialty}
                    // Handle changes with handleChange.
                    onChange={handleChange}
                    // Mark as required (for Chefs).
                    required
                  />
                {/* Close the specialty input group div. */}
                </div>
              {/* Close the React Fragment. */}
              </>
            )}

            {/* Submit button for the signup form. */}
            <button type="submit" className="btn-auth" disabled={isLoading}>
              {/* Dynamically change the button text based on the 'isLoading' state. */}
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            {/* Close the submit button. */}
            </button>

            {/* Paragraph containing a link to the login page for users who already have an account. */}
            <p className="auth-switch-link">
              {/* Text preceding the link. */}
              Already have an account? {/* Link component for navigating to the login route. */}
              <Link to="/login">Login</Link>
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
// Close the SignupComponent functional component definition.
};

// Export the SignupComponent as the default export of this module.
export default SignupComponent;