using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace RecipeNest.Api.Models
{
    public class Recipe
    {
        public int Id { get; set; }
        [Required][MaxLength(150)] public string Title { get; set; } = string.Empty;
        [MaxLength(100)] public string? Type { get; set; }
        [MaxLength(100)] public string? Cuisine { get; set; }
        [Required] public string Description { get; set; } = string.Empty;
        public string? Ingredients { get; set; }
        public string? Instructions { get; set; }
        public string? ImagePath { get; set; } // Relative path from wwwroot
        [Required] public int ChefId { get; set; }
        [ForeignKey("ChefId")] public virtual User? Chef { get; set; }
        public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();
        [NotMapped] public double AverageRating => Ratings.Any() ? Ratings.Average(r => r.RatingValue) : 0;
    }
}