using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace RecipeNest.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required][MaxLength(100)] public string Name { get; set; } = string.Empty;
        [Required][EmailAddress][MaxLength(100)] public string Email { get; set; } = string.Empty;
        [Required][JsonIgnore] public string PasswordHash { get; set; } = string.Empty;
        [Required] public Role Role { get; set; }
        [MaxLength(100)] public string? RoleTitle { get; set; }
        [MaxLength(100)] public string? Specialty { get; set; }
        public string? ProfilePicturePath { get; set; } // Relative path from wwwroot
        [JsonIgnore] public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
        [JsonIgnore] public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    }
}