using RecipeNest.Api.Models;
using System.ComponentModel.DataAnnotations;
namespace RecipeNest.Api.Dtos { 
    public class SignupDto { 
        [Required] public string Name { get; set; } = "";
        [Required][EmailAddress] public string Email { get; set; } = "";
        [Required] public string Password { get; set; } = "";
        [Required] public Role Role { get; set; } 
        public string? RoleTitle { get; set; }
        public string? Specialty { get; set; } } }