// Import React library and specific hooks (useEffect, useState) from React.
import React, { useEffect, useState } from "react";
// Import the CSS file for styling the Profile component.
import "../CSS/Profile.css";

// Define the functional component named ChefProfile.
const ChefProfile = () => {
  // Declare a state variable 'profile' to store the user's profile data, initialized to null.
  // 'setProfile' is the function to update this state.
  const [profile, setProfile] = useState(null);
  // Declare a state variable 'error' to store any error messages, initialized to an empty string.
  // 'setError' is the function to update this state.
  const [error, setError] = useState("");
  // Declare a state variable 'selectedFile' to store the file selected by the user for upload, initialized to null.
  // 'setSelectedFile' is the function to update this state.
  const [selectedFile, setSelectedFile] = useState(null);
  // Retrieve the authentication token from the browser's local storage.
  const token = localStorage.getItem("token");

  // Use the useEffect hook to perform side effects (data fetching) after the component renders.
  useEffect(() => {
    // Define an asynchronous function to fetch the user's profile data from the backend.
    const fetchProfile = async () => {
      // Start a try block to handle potential errors during the fetch operation.
      try {
        // Make an asynchronous GET request to the '/api/profile/me' endpoint.
        const res = await fetch("http://localhost:5000/api/profile/me", {
          // Specify the HTTP method as GET.
          method: "GET",
          // Define the request headers.
          headers: {
            // Include the authorization token in the 'Authorization' header using the Bearer scheme.
            Authorization: `Bearer ${token}`,
          },
        });

        // Asynchronously parse the JSON response body.
        const data = await res.json();

        // Check if the response status is not OK (e.g., 4xx or 5xx status codes).
        if (!res.ok) {
          // If the response is not OK, set the error state with the message from the response or a default message.
          setError(data.message || "Failed to fetch profile");
          // Exit the function early since an error occurred.
          return;
        }

        // If the response is OK, update the 'profile' state with the user data received from the API (expected in data.user).
        setProfile(data.user);
      // Start a catch block to handle any errors that occur during the try block (e.g., network issues).
      } catch (err) {
        // Set the error state with a generic error message.
        setError("Something went wrong.");
        // Log the actual error object to the console for debugging purposes.
        console.error(err);
      }
    };

    // Call the fetchProfile function to initiate the data fetching process.
    fetchProfile();
  // Specify the dependency array for useEffect. The effect will re-run if the 'token' value changes.
  }, [token]);

  // Define a function to handle the file input change event.
  const handleFileChange = (e) => {
    // Update the 'selectedFile' state with the first file selected by the user from the event target.
    setSelectedFile(e.target.files[0]);
  };

  // Define an asynchronous function to handle the form submission for uploading the profile picture.
  const handleUpload = async (e) => {
    // Prevent the default form submission behavior (which would cause a page reload).
    e.preventDefault();

    // Check if a file has been selected and if the profile data (specifically user_id) is available.
    if (!selectedFile || !profile?.user_id) {
      // If no file is selected or profile data is missing, show an alert to the user.
      alert("Please select a file first.");
      // Exit the function early.
      return;
    }

    // Create a new FormData object to prepare the data for sending as multipart/form-data.
    const formData = new FormData();
    // Append the selected file to the FormData object with the key 'profile_picture'.
    formData.append("profile_picture", selectedFile);

    // Start a try block to handle potential errors during the file upload fetch operation.
    try {
      // Make an asynchronous PUT request to the update picture endpoint, including the user_id in the URL.
      const res = await fetch(
        `http://localhost:5000/api/profile/update-picture/${profile.user_id}`,
        {
          // Specify the HTTP method as PUT.
          method: "PUT",
          // Define the request headers.
          headers: {
            // Include the authorization token in the 'Authorization' header.
            // Note: 'Content-Type': 'multipart/form-data' is automatically set by the browser when using FormData with fetch.
            Authorization: `Bearer ${token}`,
          },
          // Set the request body to the FormData object containing the file.
          body: formData,
        }
      );

      // Asynchronously parse the JSON response body from the upload request.
      const data = await res.json();
      // Check if the response status is not OK (upload failed).
      if (!res.ok) {
        // If the upload failed, show an alert with the error message from the response or a default message.
        alert(data.message || "Upload failed");
        // Exit the function early.
        return;
      }

      // If the upload was successful, show a success alert to the user.
      alert("Profile picture updated!");
      // Optional: Update the profile state locally to reflect the change without needing a full page refresh.
      // Use the functional update form of setState to ensure we're working with the latest state.
      setProfile((prev) => ({
        // Spread the previous profile data to keep other information intact.
        ...prev,
        // Update the 'profile_picture' field with the new picture URL/filename returned by the API,
        // or fallback to the previous picture if the API response doesn't include 'updatedPicture'.
        profile_picture: data.updatedPicture || prev.profile_picture,
      }));
    // Start a catch block to handle any errors during the upload try block (e.g., network issues).
    } catch (err) {
      // Log the detailed error information to the console for debugging.
      console.error("Error uploading:", err);
      // Show a generic error alert to the user.
      alert("Error uploading profile picture.");
    }
  };

  // Conditional rendering: If there's an error message in the 'error' state, render an error paragraph.
  if (error) return <p className="error-msg">{error}</p>;
  // Conditional rendering: If the 'profile' state is still null (data hasn't loaded yet), render a loading message.
  if (!profile) return <p className="loading-msg">Loading profile...</p>;

  // If there are no errors and the profile data has loaded, render the main component UI.
  return (
    // Render the main container div with the class 'profile-container'.
    <div className="profile-container">
      {/* Render a card div to hold the profile details with the class 'profile-card'. */}
      <div className="profile-card">
        {/* Render the profile image. */}
        <img
          // Set the image source URL dynamically, constructing it from the backend URL and the profile picture filename.
          src={`http://localhost:5000/uploads/${profile.profile_picture}`}
          // Provide alternative text for accessibility.
          alt="Profile"
          // Apply the CSS class 'profile-image' for styling.
          className="profile-image"
        />
        {/* Render a div to contain the textual profile information with the class 'profile-info'. */}
        <div className="profile-info">
          {/* Display the user's name from the profile state in an h2 heading. */}
          <h2>{profile.name}</h2>
          {/* Display the user's email in a paragraph, with the label "Email:" bolded. */}
          <p><strong>Email:</strong> {profile.email}</p>
          {/* Display the user's role in a paragraph, with the label "Role:" bolded. */}
          <p><strong>Role:</strong> {profile.role}</p>
        {/* Close the profile-info div. */}
        </div>

        {/* JSX comment indicating the start of the file upload form section. */}
        {/* Render the form for uploading a new profile picture. */}
        <form onSubmit={handleUpload} className="upload-form">
          {/* Render a file input element. When a file is selected, call handleFileChange. */}
          <input type="file" onChange={handleFileChange} />
          {/* Render a submit button for the form. */}
          <button type="submit">Upload New Picture</button>
        {/* Close the form element. */}
        </form>
      {/* Close the profile-card div. */}
      </div>
    {/* Close the profile-container div. */}
    </div>
  );
// Close the ChefProfile functional component definition.
};

// Export the ChefProfile component as the default export of this module.
export default ChefProfile;