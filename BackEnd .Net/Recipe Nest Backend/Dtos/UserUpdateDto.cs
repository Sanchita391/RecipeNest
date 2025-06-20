using System.ComponentModel.DataAnnotations;
namespace RecipeNest.Api.Dtos {
    public class UserUpdateDto {
        [Required] public string Name { get; set; } = "";
        [Required][EmailAddress] public string Email { get; set; } = "";
        public string? Password { get; set; }
        public string? RoleTitle { get; set; }
        public string? Specialty { get; set; } } }