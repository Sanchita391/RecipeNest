namespace RecipeNest.Api.Dtos
{
    public class ChefStatsDto
    {
        public double OverallAverageRating { get; set; }
        public int TotalRecipeViews { get; set; }
        public int TotalRecipes { get; set; } // Adding total recipes is easy here too
    }
}