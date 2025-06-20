// Import React library and necessary hooks: useState, useEffect, useCallback.
import React, { useState, useEffect, useCallback } from "react";
// Import the Link component from react-router-dom for navigation.
import { Link } from "react-router-dom";
// Import the CSS file for styling the Home component.
import "./Home.css";
// Comment indicating that the GalleryComponent import was intentionally removed.
// import GalleryComponent from "./GalleryComponent"; // <--- REMOVED THIS LINE

// Define the Base URL constant for the backend API endpoint.
const API_BASE_URL = "https://localhost:7092"; // <-- Make sure this is correct

// Define a helper functional component for rendering a clickable star rating input.
const StarRatingInput = ({ rating, setRating }) => {
    // State to track the rating value when hovering over stars for visual feedback.
    const [hoverRating, setHoverRating] = useState(0);

    // Return the JSX structure for the star rating input.
    return (
        // Container div for the star rating input elements.
        <div className="star-rating-input">
            {/* Create an array of numbers [1, 2, 3, 4, 5] and map over it to render each star. */}
            {[1, 2, 3, 4, 5].map((star) => (
                // Render each star as a span element.
                <span
                    // Use the star number as the unique key for React list rendering.
                    key={star}
                    // Dynamically set the CSS class: 'star' is always applied, 'filled' is added if the current star number is less than or equal to the hoverRating or the actual rating.
                    className={`star ${(hoverRating || rating) >= star ? 'filled' : ''}`}
                    // Attach an onClick event handler to call the setRating function passed via props with the current star's value.
                    onClick={() => setRating(star)}
                    // Attach an onMouseEnter event handler to update the hoverRating state when the mouse enters a star.
                    onMouseEnter={() => setHoverRating(star)}
                    // Attach an onMouseLeave event handler to reset the hoverRating state when the mouse leaves a star.
                    onMouseLeave={() => setHoverRating(0)}
                >
                    {/* Display the Unicode star character. */}
                    ★
                </span>
            ))}
        {/* Close the container div. */}
        </div>
    );
// Close the StarRatingInput component definition.
};

// Define a helper function to render stars for display purposes only (not interactive).
const renderStarsDisplay = (rating) => {
    // Initialize an empty array to store the star span elements.
    const stars = [];
    // Loop from 1 to 5 to generate each star.
    for (let i = 1; i <= 5; i++) {
        // Push a span element into the stars array for each iteration.
        // Apply the 'star' class always, and the 'filled' class conditionally if 'i' is less than or equal to the provided rating.
        stars.push(<span key={i} className={i <= rating ? "star filled" : "star"}>★</span>);
    }
    // Return a div containing all the generated star spans, wrapped with a specific class for styling.
    return <div className="star-rating-display">{stars}</div>;
// Close the renderStarsDisplay function definition.
};


// Define the main HomeComponent functional component.
const HomeComponent = () => {
  // State variable to hold the text entered in the review form's textarea. Initialized as an empty string.
  const [reviewText, setReviewText] = useState("");
  // State variable to hold the numeric rating selected in the review form. Initialized to 0 (no rating).
  const [ratingValue, setRatingValue] = useState(0); // 0 means no rating selected
  // State variable to track whether the review form is currently being submitted (used to disable button). Initialized to false.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State variable to store feedback messages (like success or error) after form submission. Initialized as an object with type and text properties.
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // State variable to store the array of approved reviews fetched from the API. Initialized as an empty array.
  const [approvedReviews, setApprovedReviews] = useState([]);
  // State variable to track whether the approved reviews are currently being loaded. Initialized to true.
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Define a memoized asynchronous function to fetch approved public reviews using useCallback.
  const fetchApprovedReviews = useCallback(async () => {
      // Set the loading state to true before starting the fetch.
      setIsLoadingReviews(true);
      // Start a try block to handle potential errors during the fetch operation.
      try {
          // Make an asynchronous GET request to the public reviews API endpoint.
          const res = await fetch(`${API_BASE_URL}/api/PublicReviews`); // Public endpoint
          // Check if the response status code indicates success (e.g., 200 OK).
          if (!res.ok) {
              // If the response is not ok, throw an error with the status code.
              throw new Error(`HTTP error fetching reviews! status: ${res.status}`);
          }
          // Parse the JSON response body.
          const data = await res.json();
          // Update the approvedReviews state. If the data is an array, use it; otherwise, use an empty array.
          setApprovedReviews(Array.isArray(data) ? data : []);
      // Catch any errors that occur during the try block (fetch or parsing).
      } catch (error) {
          // Log the error to the console for debugging purposes.
          console.error("Failed to fetch approved reviews:", error);
          // Reset the approvedReviews state to an empty array in case of an error.
          setApprovedReviews([]); // Clear on error
          // Comment suggesting optional user-facing error message handling.
          // Optionally set an error message state to display to user
      // The finally block executes regardless of whether the try block succeeded or an error was caught.
      } finally {
          // Set the loading state back to false after the fetch attempt is complete.
          setIsLoadingReviews(false);
      }
  // The dependency array is empty, meaning this useCallback instance is created once and never changes.
  }, []);

  // Use the useEffect hook to call fetchApprovedReviews when the component mounts.
  useEffect(() => {
      // Call the function to fetch reviews.
      fetchApprovedReviews();
  // The dependency array contains fetchApprovedReviews. The effect runs when the component mounts and if fetchApprovedReviews changes (which it won't due to useCallback with empty deps).
  }, [fetchApprovedReviews]);

  // Define an asynchronous function to handle the submission of the review form.
  const handleReviewSubmit = async (e) => {
      // Prevent the default form submission behavior which causes a page reload.
      e.preventDefault();
      // Clear any previous success or error messages before starting a new submission attempt.
      setSubmitMessage({ type: '', text: '' }); // Clear previous messages

      // --- Input Validation ---
      // Check if the review text (after trimming whitespace) is empty.
      if (!reviewText.trim()) {
          // If empty, set an error message and exit the function.
          setSubmitMessage({ type: 'error', text: 'Review text cannot be empty.' });
          return;
      }
      // Check if the review text length is outside the allowed range (5-1000 characters).
       if (reviewText.length < 5 || reviewText.length > 1000) {
           // If invalid length, set an error message and exit.
           setSubmitMessage({ type: 'error', text: 'Review must be between 5 and 1000 characters.' });
           return;
       }
      // Check if the rating value is outside the valid range (1-5).
      if (ratingValue < 1 || ratingValue > 5) {
          // If invalid rating, set an error message and exit.
          setSubmitMessage({ type: 'error', text: 'Please select a rating between 1 and 5.' });
          return;
      }
      // --- End Validation ---

      // Set the submitting state to true to indicate the submission process has started (e.g., disable submit button).
      setIsSubmitting(true);

      // Start a try block to handle potential errors during the API call.
      try {
          // Create the data transfer object (DTO) containing the review data to be sent.
          const reviewDto = {
              reviewText: reviewText,    // The review text from state.
              ratingValue: ratingValue,  // The rating value from state.
          };

          // Make an asynchronous POST request to the public reviews API endpoint.
          const res = await fetch(`${API_BASE_URL}/api/PublicReviews`, {
              // Specify the HTTP method as POST.
              method: "POST",
              // Set the request headers.
              headers: {
                  // Indicate that the request body contains JSON data.
                  'Content-Type': 'application/json',
                  // Comment noting that Authorization is usually not needed for public submissions.
                  // No Authorization header needed for public submission (usually)
              },
              // Convert the reviewDto JavaScript object into a JSON string for the request body.
              body: JSON.stringify(reviewDto),
          });

          // Check if the response status indicates success (200 OK or 201 Created).
          if (res.ok || res.status === 201) {
              // If successful, set a success message to display to the user.
              setSubmitMessage({ type: 'success', text: 'Review submitted successfully! It will appear after approval.' });
              // Clear the review text input field by resetting its state.
              setReviewText(""); // Clear form
              // Clear the selected rating by resetting its state to 0.
              setRatingValue(0);   // Clear rating
              // Comment suggesting optional re-fetching of reviews for immediate (but maybe delayed) updates.
              // Optionally re-fetch reviews if you want immediate (though unlikely) updates
              // fetchApprovedReviews();
          // If the response status indicates an error.
          } else {
              // Initialize a default error message.
              let errorMessage = "Failed to submit review.";
              // Start a nested try block to attempt parsing a more specific error message from the response body.
              try {
                   // Check the 'Content-Type' header of the response.
                   const contentType = res.headers.get("content-type");
                   // If the content type indicates JSON data.
                   if (contentType && contentType.indexOf("application/json") !== -1) {
                      // Parse the JSON error data from the response body.
                      const errorData = await res.json();
                      // Specifically handle ASP.NET Core validation error format (ProblemDetails).
                      if (errorData.errors) {
                          // If validation errors exist, flatten them into a single string.
                          errorMessage = Object.values(errorData.errors).flat().join(' ');
                      // Otherwise, try to use standard error properties like 'message' or 'title'.
                      } else {
                           errorMessage = errorData.message || errorData.title || errorMessage;
                      }
                   // If the content type is not JSON.
                   } else {
                       // Try to get the error message from the plain text response body or fallback to status text.
                       errorMessage = await res.text() || res.statusText || errorMessage;
                   }
              // Catch any errors during the error message parsing process.
              } catch (e) {
                  // Fallback to using the response status text or the default message if parsing fails.
                  errorMessage = res.statusText || errorMessage;
              }
               // Set the error message state to display the parsed or default error message.
               setSubmitMessage({ type: 'error', text: `Error: ${errorMessage}` });
          }
      // Catch any network errors or other exceptions during the fetch/submission process.
      } catch (error) {
          // Log the error to the console.
          console.error("Error submitting review:", error);
           // Set a generic network error message to display to the user.
           setSubmitMessage({ type: 'error', text: 'An network error occurred while submitting the review.' });
      // The finally block ensures this code runs after the try/catch block completes.
      } finally {
          // Set the submitting state back to false, re-enabling the submit button.
          setIsSubmitting(false);
      }
  // Close the handleReviewSubmit function definition.
  };

  // Return the JSX structure for the Home component.
  return (
    // Main container div for the entire home page content.
    <div className="home-container">

      {/* Hero Section: Displays introductory content and call-to-action buttons. */}
      <header className="hero-section">
        {/* Container for the text content within the hero section. */}
         <div className="hero-text">
          {/* Main heading for the hero section. */}
          <h1>Cooking together with the experts.</h1>
          {/* Paragraph describing the community aspect. */}
          <p>
            Cooking is more fun when done together! Join expert chefs as they share their
            knowledge, tips, and secret techniques to help you master the art of cooking.
          </p>
          {/* Container for the call-to-action buttons. */}
          <div className="hero-buttons">
            {/* ***** UPDATED LINK ***** */}
            {/* Link component navigating to the RECIPES page with light button styling. */}
            <Link to="/recipes" className="btn-light">Let's Cook</Link>
            {/* ***** UPDATED LINK ***** */}
            {/* Link component navigating to the GALLERY page with dark button styling. */}
            <Link to="/gallery" className="btn-dark">Explore Now</Link>
          </div>
        {/* Close the hero-text container. */}
        </div>
        {/* Container for the image within the hero section. */}
        <div className="hero-image">
          {/* Image element for the hero section. */}
          <img src="/images/Side-image-for-recipenest.jpeg" alt="Cooking" className="hero-img" />
        {/* Close the hero-image container. */}
        </div>
      {/* Close the hero-section header. */}
      </header>

      {/* Features Section: Highlights key features or categories of the site. */}
      <section className="features-section section-padding"> {/* Added class for padding. */}
        {/* Heading for the features section. */}
         <h2>Get many interesting Features.</h2>
        {/* Container for the individual feature cards. */}
        <div className="feature-cards">
        {/* Array containing data for each feature card. */}
        {[
          { title: "Main Dishes", text: "Discover a world of hearty meals with happy heart...", img: "/images/Maindishlast.jpg", link: "/Maindishes" },
          { title: "Fast Foods", text: "Satisfy your cravings with fresh fast food...", img: "/images/fastfoodlast.webp", link: "/FastFood" },
          { title: "Desserts", text: "Indulge in delicious desserts to sweeten your day...", img: "/images/dessertlast.png", link: "/Dessert" },
        // Map over the feature data array to render each card dynamically.
        ].map((feature, index) => (
          // Container div for a single feature card, using the index as the key.
          <div key={index} className="feature-card">
            {/* Image for the feature card. */}
            <img src={feature.img} alt={feature.title} className="feature-img" />
            {/* Title of the feature. */}
            <h3>{feature.title}</h3>
            {/* Description text for the feature. */}
            <p>{feature.text}</p>
            {/* Link component navigating to the specific feature's page. */}
            <Link to={feature.link} className="learn-more">Learn More</Link>
          {/* Close the feature-card div. */}
          </div>
        ))}
        {/* Close the feature-cards container. */}
        </div>
      {/* Close the features-section. */}
      </section>

      {/* Community Section: Encourages user interaction and learning from experts. */}
      <section className="community-section section-padding"> {/* Added class for padding. */}
        {/* Main heading for the community section. */}
          <h1>Cooking together with the experts.</h1>
        {/* Descriptive paragraph about the community aspect. */}
        <p>
          Cooking is more fun when done together! Join expert chefs as they share their knowledge, tips,
          and secret techniques to help you master the art of cooking. Whether you're a beginner or a
          seasoned foodie, learning side by side with professionals makes every dish special. Let's create,
          experiment, and bring flavors to life together.
        </p>        {/* Link component acting as a call-to-action button, leading to the login page. */}
        <Link to="/login" className="btn-join">Learn More</Link> {/* Changed text to Learn More as per image */}
        {/* Container for the image related to the community section. */}
        <div className="community-image">
          {/* Image element representing community cooking. */}
          <img src="/images/chef6recipenest-removebg-preview.png" alt="Community Cooking" />
        {/* Close the community-image container. */}
        </div>
      {/* Close the community-section. */}
      </section>

      {/* Expert Chefs Section: Showcases some of the chefs featured on the platform. */}
      <section className="expert-chefs section-padding"> {/* Added class for padding. */}
        {/* Section title heading. */}
         <h3 className="section-title">Let's meet the experts.</h3>
        {/* Container holding the cards for individual chefs. */}
        <div className="chefs-container">
          {/* Array containing data for each chef card. */}
          {[
            { name: "Mike Jordan", img: "/images/Chef4recipenest.jpg" },
            { name: "Rose Jake", img: "/images/Chef2recipenest.jpg" },
            { name: "Elon Morgay", img: "/images/Chef3recipenest.jpg" },
            { name: "Dev Pasley", img: "/images/Chef4recipenest.jpg" },
          // Map over the chef data array to render each chef card.
          ].map((chef, index) => (
            // Container div for a single chef card, using index as the key.
            // Comment noting removal of an extra inner div based on CSS structure.
            // Removed extra inner div as per CSS structure
            <div key={index} className="chef-card">
              {/* Image of the chef. */}
              <img src={chef.img} alt={chef.name} className="chef-image" />
              {/* Chef's name heading. */}
              <h4>{chef.name}</h4>
              {/* Chef's title/role paragraph. */}
              <p>Senior Chef</p>
            {/* Close the chef-card div. */}
            </div>
          ))}
        {/* Close the chefs-container. */}
        </div>
      {/* Close the expert-chefs section. */}
      </section>

      {/* Reviews Section: Contains the form to submit reviews and displays approved reviews. */}
      <section className="reviews-section"> {/* Main container manages padding/background. */}
        {/* Heading for the reviews section. */}
        <h1>Reviews and Ratings</h1>

        {/* Review Submission Form: Allows users to submit ratings and text reviews. */}
        <form onSubmit={handleReviewSubmit} className="review-form">
          {/* Sub-heading for the form. */}
          <h3>Leave a Review</h3>
          {/* Form group containing the star rating input. */}
          <div className="form-group star-rating-group">
             {/* Label for the star rating input. */}
             <label>Your Rating:</label>
             {/* Render the interactive StarRatingInput component, passing state and setter. */}
             <StarRatingInput rating={ratingValue} setRating={setRatingValue} />
          {/* Close the star-rating-group div. */}
          </div>
          {/* Form group containing the review text area. */}
          <div className="form-group">
              {/* Label for the text area input. */}
              <label htmlFor="reviewText">Your Review:</label>
              {/* Textarea element for users to type their review. */}
              <textarea
                  // Link the id to the label's htmlFor attribute for accessibility.
                  id="reviewText"
                  // Bind the value of the textarea to the reviewText state variable.
                  value={reviewText}
                  // Update the reviewText state whenever the textarea content changes.
                  onChange={(e) => setReviewText(e.target.value)}
                  // Placeholder text shown when the textarea is empty.
                  placeholder="Share your thoughts about RecipeNest..."
                  // Suggest initial number of visible text lines.
                  rows="4"
                  // Set maximum character length, matching backend validation.
                  maxLength="1000" // Corresponds to DTO validation
                  // Mark the textarea as required for form submission.
                  required
              />
          {/* Close the form-group div. */}
          </div>
          {/* Conditional rendering: Display the submission message (success/error) if text exists. */}
          {submitMessage.text && (
               // Paragraph element to show the message, with dynamic class for styling (e.g., 'success' or 'error').
               <p className={`submit-message ${submitMessage.type}`}>{submitMessage.text}</p>
           )}
          {/* Submit button for the form. */}
          <button type="submit" className="btn-submit-review" disabled={isSubmitting}>
              {/* Dynamically change button text based on the isSubmitting state. */}
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
          {/* Close the submit button. */}
          </button>
        {/* Close the review form. */}
        </form>

        {/* Display Approved Reviews: Section showing reviews fetched from the API. */}
        <div className="approved-reviews-display">
            {/* Sub-heading for the displayed reviews section. */}
            <h2>What Others Are Saying</h2>
            {/* Conditional rendering: Show a loading message while reviews are being fetched. */}
            {isLoadingReviews && <p>Loading reviews...</p>}
            {/* Conditional rendering: Show message if loading is finished and no reviews were found. */}
            {!isLoadingReviews && approvedReviews.length === 0 && (
                <p>No reviews have been approved yet. Be the first!</p>
            )}
            {/* Conditional rendering: Display the list of reviews if loading is finished and reviews exist. */}
            {!isLoadingReviews && approvedReviews.length > 0 && (
                // Container div for the list of review cards.
                <div className="review-list public-review-list">
                    {/* Map over the approvedReviews array to render each review. */}
                    {approvedReviews.map(review => (
                        // Container div for a single review card, using the review's id as the key.
                        <div key={review.id} className="review-card public-review-card">
                            {/* Header section within the review card. */}
                            <div className="review-header">
                                {/* Render the star rating display using the helper function. */}
                                {renderStarsDisplay(review.ratingValue)}
                                {/* Span element to display the submission date, formatted locally. */}
                                <span className="review-date">
                                    {/* Convert the ISO date string to a Date object and format it. */}
                                    {new Date(review.submittedAt).toLocaleDateString()}
                                {/* Close the date span. */}
                                </span>
                            {/* Close the review-header div. */}
                            </div>
                            {/* Paragraph element displaying the actual text content of the review. */}
                            <p className="review-text">{review.reviewText}</p>
                        {/* Close the review-card div. */}
                        </div>
                    ))}
                {/* Close the review-list div. */}
                </div>
            )}
        {/* Close the approved-reviews-display container. */}
        </div>
      {/* Close the reviews-section. */}
      </section>

      {/* Contact Section: Displays contact information and social media links. */}
      <section className="contact-section section-padding"> {/* Changed div to section, added padding */}
        {/* Heading for the contact section. */}
          <h1>Contact Us :</h1>
        {/* Paragraph displaying the phone number. */}
        <p>📞 +977 9745711559</p>
        {/* Paragraph displaying the email address. */}
        <p>✉️ recipenest@gmail.com</p>
        {/* Tagline or brand message. */}
        <p>RecipeNest - Enjoy our Recipes</p>
        {/* Call to action for social media follows. */}
        <p>Follow us:</p>
        {/* Container for the social media icons/links. */}
        <div className="social-icons">
            {/* Link to Instagram profile, opening in a new tab. */}
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                {/* Instagram icon image. */}
                <img src="/images/Instagram.webp" alt="Instagram" />
            {/* Close the Instagram link. */}
            </a>
            {/* Link to Facebook profile, opening in a new tab. */}
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                {/* Facebook icon image. */}
                <img src="/images/facebook.webp" alt="Facebook" />
            {/* Close the Facebook link. */}
            </a>
            {/* Link to Twitter profile, opening in a new tab. */}
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                {/* Twitter icon image. */}
                <img src="/images/twitter.webp" alt="Twitter" />
            {/* Close the Twitter link. */}
            </a>
        {/* Close the social-icons container. */}
        </div>
      {/* Close the contact-section. */}
      </section>

      {/* Footer Section: Displays copyright information. */}
      <footer className="footer-section">
        {/* Paragraph containing the copyright notice with a static year (consider making dynamic). */}
        <p>© 2025 RecipeNest. All Rights Reserved.</p>
      {/* Close the footer-section. */}
      </footer>
    {/* Close the main home-container div. */}
    </div>
  );
// Close the HomeComponent definition.
};

// Export the HomeComponent as the default export of this module.
export default HomeComponent;