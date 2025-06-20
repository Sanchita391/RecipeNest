using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace RecipeNest.Api.Models
{
    public class Rating
    {
        public int Id { get; set; }
        [Required][Range(1, 5)] public int RatingValue { get; set; }
        public DateTime RatedAt { get; set; } = DateTime.UtcNow;
        [Required] public int RecipeId { get; set; }
        [Required] public int UserId { get; set; } // FoodLover
        [ForeignKey("RecipeId")] public virtual Recipe? Recipe { get; set; }
        [ForeignKey("UserId")] public virtual User? User { get; set; }
    }
}