// Import React library and necessary hooks: useState for managing state, useEffect for handling side effects.
import React, { useState, useEffect } from 'react';

// Define the functional component named MyRecipes.
const MyRecipes = () => {
    // Declare a state variable 'recipes' to hold the list of user's recipes, initialized as an empty array.
    // 'setRecipes' is the function used to update this state.
    const [recipes, setRecipes] = useState([]);
    // Declare a state variable 'isLoading' to track the loading status of the data fetch, initialized to true.
    // 'setIsLoading' is the function to update the loading state.
    const [isLoading, setIsLoading] = useState(true);
    // Declare a state variable 'error' to store any error messages during the fetch, initialized to null.
    // 'setError' is the function to update the error state.
    const [error, setError] = useState(null);

    // Define a helper function to retrieve the authentication token from the browser's local storage.
    const getAuthToken = () => {
        // Return the value stored under the key 'authToken' in local storage.
        return localStorage.getItem('authToken');
    };

    // Use the useEffect hook to perform the data fetching side effect when the component mounts.
    useEffect(() => {
        // Define an asynchronous function responsible for fetching the recipes associated with the logged-in user.
        const fetchMyRecipes = async () => {
            // Comment indicating the start of the fetch logic block.
            // ... (fetch logic as before) ...
             // Set the loading state to true at the beginning of the fetch process.
             setIsLoading(true);
            // Clear any previous error messages before starting a new fetch attempt.
            setError(null);
            // Call the helper function to retrieve the authentication token.
            const token = getAuthToken();

            // Check if an authentication token was successfully retrieved.
            if (!token) {
                // If no token is found, set an error message indicating authentication is required.
                setError('Authentication token not found. Please log in.');
                // Set the loading state to false since the fetch cannot proceed without a token.
                setIsLoading(false);
                // Exit the function early.
                return;
            }

            // Start a try block to handle potential errors during the API request.
            try {
                // Make an asynchronous GET request to the '/api/recipe/my-recipes' endpoint.
                const response = await fetch('/api/recipe/my-recipes', {
                    // Specify the HTTP method as GET.
                    method: 'GET',
                    // Define the request headers.
                    headers: {
                        // Include the Authorization header with the retrieved token using the Bearer scheme.
                        'Authorization': `Bearer ${token}`,
                        // Specify that the client accepts JSON responses.
                        'Accept': 'application/json'
                    },
                });

                // Check if the response status code indicates failure (not in the 200-299 range).
                if (!response.ok) {
                    // Initialize a default error object containing the HTTP status text.
                    let errorData = { message: `HTTP error! Status: ${response.status}` };
                    // Start a nested try block to attempt parsing a more specific error message from the response body (if it's JSON).
                    try {
                        // Attempt to parse the response body as JSON.
                        const parsedError = await response.json();
                        // Check if the parsed error exists and contains a 'message' property.
                        if (parsedError && parsedError.message) {
                             // If a specific message exists, update the errorData object with it.
                             errorData.message = parsedError.message;
                        }
                    // Catch any errors that occur during the parsing of the error response body.
                    } catch (parseError) {
                         // Log a warning to the console if parsing the error response body fails.
                         console.warn("Could not parse error response body:", parseError);
                    }
                    // Throw a new Error using the determined error message (either specific from JSON or the default HTTP status message).
                    throw new Error(errorData.message);
                }

                // If the response status is OK (2xx), parse the successful JSON response body.
                const data = await response.json();
                // Update the 'recipes' state with the array of recipe data received from the API.
                setRecipes(data);

            // Catch any errors that occurred during the try block (e.g., network errors, thrown errors).
            } catch (err) {
                // Log the detailed error object to the console for debugging purposes.
                console.error("Failed to fetch recipes:", err);
                // Set the 'error' state with the error message or a generic fallback message.
                setError(err.message || 'An unexpected error occurred while fetching recipes.');
            // The 'finally' block executes regardless of whether the try/catch block succeeded or failed.
            } finally {
                // Set the loading state back to false, indicating the fetch attempt (successful or failed) is complete.
                setIsLoading(false);
            }
        };
        // Call the fetchMyRecipes function defined above to initiate the data fetching process.
        fetchMyRecipes();
    // The empty dependency array [] ensures that this useEffect hook runs only once after the component's initial render.
    }, []);

    // Define a helper function to render an image from base64 data or display a placeholder if no image data is available.
    const renderImage = (imageData) => {
        // Comment indicating the start of the image rendering logic block.
        // ... (image rendering logic as before) ...
        // Check if the 'imageData' prop is provided (truthy).
        if (imageData) {
            // Construct a data URL string for a base64 encoded JPEG image.
            const imageUrl = `data:image/jpeg;base64,${imageData}`;
            // Return an HTML img element with the data URL as the source and apply inline styles for size, fit, margin, and border radius.
            return <img src={imageUrl} alt="Recipe" style={{ width: '80px', height: '80px', objectFit: 'cover', marginRight: '15px', borderRadius: '4px' }} />;
        }
        // If 'imageData' is not provided, return a placeholder div element with specific styling.
        return <div style={{ width: '80px', height: '80px', backgroundColor: '#f0f0f0', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px', borderRadius: '4px' }}>No Image</div>;

    // Close the renderImage function definition.
    };

    // Conditional rendering: If the 'isLoading' state is true, display a loading message.
    if (isLoading) return <div>Loading your recipes...</div>;
    // Conditional rendering: If the 'error' state is not null (meaning an error occurred), display the error message with red styling.
    if (error) return <div style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</div>;
    // Conditional rendering: If loading is complete and there's no error, but the 'recipes' array is empty, display a message indicating no recipes were found.
    if (recipes.length === 0) return <div>You haven't added any recipes yet. Create your first one!</div>;

    // If loading is complete, there are no errors, and recipes exist, render the main component UI.
    return (
        // Comment indicating the start of the main JSX structure block.
        // ... (JSX structure as before) ...
        // Main container div for the component, applying basic font styling.
         <div style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Heading for the "My Recipes" section. */}
            <h2>My Recipes</h2>
            {/* Unordered list (ul) element to display the recipes. Inline style removes default list styling and padding. */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {/* Map over the 'recipes' array in the state. For each 'recipe' object in the array, render a list item (li). */}
                {recipes.map((recipe) => (
                    // List item (li) element representing a single recipe. Use the recipe's unique 'id' as the key prop for React's list rendering optimization. Apply inline styles for layout and appearance.
                    <li key={recipe.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', alignItems: 'center' }}>
                        {/* Call the 'renderImage' helper function, passing the recipe's imageData to display the image or placeholder. */}
                        {renderImage(recipe.imageData)}
                        {/* Div container for the recipe's textual details. 'flexGrow: 1' allows it to take up the remaining horizontal space. */}
                        <div style={{ flexGrow: 1 }}>
                            {/* Display the recipe's title using a strong tag for emphasis and increased font size. */}
                            <strong style={{ fontSize: '1.1em' }}>{recipe.title}</strong>
                            {/* Div containing secondary recipe details like cuisine, type, and category name. Use optional chaining (?.) for category name in case category is null/undefined, provide 'N/A' fallback. */}
                            <div style={{ fontSize: '0.9em', color: '#555', marginTop: '4px' }}>
                                Cuisine: {recipe.cuisine} | Type: {recipe.type} | Category: {recipe.category?.name || 'N/A'}
                            {/* Close the secondary details div. */}
                            </div>
                            {/* Div containing action links/buttons related to the recipe. */}
                            <div style={{ marginTop: '8px' }}>
                                {/* Anchor tag (a) linking to the detailed view page for this recipe. */}
                                <a href={`/recipes/view/${recipe.id}`} style={{ marginRight: '10px', textDecoration: 'none' }}>View</a>
                                {/* Anchor tag (a) linking to the edit page for this recipe. */}
                                <a href={`/recipes/edit/${recipe.id}`} style={{ marginRight: '10px', textDecoration: 'none' }}>Edit</a>
                                {/* Button element to trigger the delete action. Currently shows an alert placeholder; needs a proper delete handler implementation. */}
                                <button onClick={() => alert(`Delete ${recipe.id}? Implement handler.`)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                            {/* Close the actions div. */}
                            </div>
                        {/* Close the recipe details container div. */}
                        </div>
                    {/* Close the list item (li) element. */}
                    </li>
                ))}
            {/* Close the unordered list (ul) element. */}
            </ul>
        {/* Close the main container div. */}
        </div>
    );
// Close the MyRecipes functional component definition.
};

// Export the MyRecipes component as the default export of this module, making it available for import in other files.
export default MyRecipes;