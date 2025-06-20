using System;
using System.ComponentModel.DataAnnotations;

namespace RecipeNest.Api.Models
{
    public enum ReviewStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public class PublicReview
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(1000)]
        public string ReviewText { get; set; } = string.Empty;

        [Range(1, 5)]
        public int RatingValue { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
    }
}
