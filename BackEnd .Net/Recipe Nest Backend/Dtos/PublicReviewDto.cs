using System.ComponentModel.DataAnnotations;

namespace RecipeNest.Api.Dtos
{
    public class PublicReviewDto
    {
        [Required(ErrorMessage = "Review text is required.")]
        [StringLength(1000, MinimumLength = 5, ErrorMessage = "Review must be between 5 and 1000 characters.")]
        public string ReviewText { get; set; } = string.Empty;

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int RatingValue { get; set; }
    }
}
