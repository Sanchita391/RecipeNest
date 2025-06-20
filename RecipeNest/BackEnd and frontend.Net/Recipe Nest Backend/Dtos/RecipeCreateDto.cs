using System.ComponentModel.DataAnnotations;
namespace RecipeNest.Api.Dtos {
    public class RecipeCreateDto {
        [Required] public string Title { get; set; } = "";
        public string? Type { get; set; } 
        public string? Cuisine { get; set; } 
        [Required] public string Description { get; set; } = ""; 
        public string? Ingredients { get; set; } 
        public string? Instructions { get; set; }
        public IFormFile? Image { get; set; } } }