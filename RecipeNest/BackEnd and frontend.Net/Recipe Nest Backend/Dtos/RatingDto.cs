using System.ComponentModel.DataAnnotations;
namespace RecipeNest.Api.Dtos { public class RatingDto { 
        [Required] public int RecipeId { get; set; } 
        [Required][Range(1, 5)] public int Rating { get; set; } } }