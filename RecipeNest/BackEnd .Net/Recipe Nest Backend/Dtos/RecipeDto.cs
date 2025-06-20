namespace RecipeNest.Api.Dtos { 
    public class RecipeDto {
        public int Id { get; set; }
        public string Title { get; set; } = ""; 
        
        public string? Type { get; set; } 
        public string? Cuisine { get; set; }
        
        public string Description { get; set; } = ""; 
        public string? Ingredients { get; set; } 
        public string? Instructions { get; set; } 
        public string? ImageUrl { get; set; } 
        public int ChefId { get; set; } 
        public string? ChefName { get; set; } 
        public double AverageRating { get; set; } } }