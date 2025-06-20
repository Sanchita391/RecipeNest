// Import the React library, which is necessary for creating React components.
import React from "react";

// Define a functional component named ChefRecipeComponent.
// It accepts 'recipes' (an array of recipe objects) and 'onDelete' (a function) as props.
const ChefRecipeComponent = ({ recipes, onDelete }) => {
  // Return the JSX structure that represents the component's UI.
  return (
    // Render a main container div with the class 'recipe-dashboard'.
    <div className="recipe-dashboard">
      {/* Render an h2 heading displaying "My Recipes". */}
      <h2>My Recipes</h2>
      {/* Use a ternary operator for conditional rendering based on whether the 'recipes' array is empty. */}
      {recipes.length === 0 ? (
        // If the 'recipes' array is empty, render a paragraph indicating no recipes were found.
        <p>No recipes found.</p>
      ) : (
        // If the 'recipes' array is not empty, render a div to contain the list of recipes.
        <div className="recipe-list">
          {/* Map over the 'recipes' array to render a card for each recipe object. */}
          {recipes.map((recipe) => (
            // Render a div for each recipe card. The 'key' prop is essential for list rendering in React, using the unique recipe ID. Assign the class 'recipe-card'.
            <div key={recipe.id} className="recipe-card">
              {/* Render an h3 heading displaying the recipe's title. */}
              <h3>{recipe.title}</h3>
              {/* Display the recipe's cuisine in a paragraph, with the label "Cuisine:" bolded. */}
              <p><strong>Cuisine:</strong> {recipe.cuisine}</p>
              {/* Display the recipe's type in a paragraph, with the label "Type:" bolded. */}
              <p><strong>Type:</strong> {recipe.type}</p>
              {/* Display the recipe's category name in a paragraph, using optional chaining (?.) in case 'category' is undefined. Label "Category:" is bolded. */}
              <p><strong>Category:</strong> {recipe.category?.name}</p>
              {/* Display the recipe's rating in a paragraph, with the label "Rating:" bolded. */}
              <p><strong>Rating:</strong> {recipe.rating}</p>
              {/* Display the recipe's description in a paragraph, with the label "Description:" bolded. */}
              <p><strong>Description:</strong> {recipe.description}</p>
              {/* Conditionally render the recipe image only if 'recipe.imageUrl' exists. */}
              {recipe.imageUrl && (
                // Render an img element for the recipe image.
                <img
                  // Set the image source using a data URL format for base64 encoded images.
                  src={`data:image/jpeg;base64,${recipe.imageUrl}`}
                  // Set the alternative text for the image using the recipe title.
                  alt={recipe.title}
                  // Apply the CSS class 'recipe-image' for styling.
                  className="recipe-image"
                  // Apply inline styles to set the width and border-radius of the image.
                  style={{ width: "150px", borderRadius: "10px" }}
                />
              )}
              {/* Render a button element for deleting the recipe. */}
              {/* Attach an onClick event handler that calls the 'onDelete' function passed via props, providing the recipe's ID as an argument. */}
              <button onClick={() => onDelete(recipe.id)}>Delete</button>
            {/* Close the recipe-card div. */}
            </div>
          ))}
        {/* Close the recipe-list div. */}
        </div>
      )}
    {/* Close the recipe-dashboard div. */}
    </div>
  );
// Close the ChefRecipeComponent functional component definition.
};

// Export the ChefRecipeComponent as the default export of this module, making it available for import in other files.
export default ChefRecipeComponent;