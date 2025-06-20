// File: Dtos/ChefStatsDto.cs

namespace RecipeNest.Api.Dtos // Ensure this namespace matches your project structure
{
    /// <summary>
    /// Data Transfer Object for representing a Chef's statistics.
    /// Used primarily for the Chef Dashboard.
    /// </summary>
    public class ChefStatsDto
    {
        /// <summary>
        /// The calculated average rating across all of the Chef's recipes
        /// that have received at least one rating. Returns 0 if no recipes are rated.
        /// </summary>
        public double OverallAverageRating { get; set; }

        /// <summary>
        /// The total sum of views across all of the Chef's recipes.
        /// </summary>
        public int TotalRecipeViews { get; set; }

        /// <summary>
        /// The total number of recipes created by the Chef.
        /// </summary>
        public int TotalRecipes { get; set; }
    }
}