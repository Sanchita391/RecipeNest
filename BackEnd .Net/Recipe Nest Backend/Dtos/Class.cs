namespace RecipeNest.Api.Dtos { public class UserProfileDto { 
        public int Id { get; set; } 
        public string Name { get; set; } = "";
        public string Email { get; set; } = ""; 
        public string Role { get; set; } = ""; public string? RoleTitle { get; set; } 
        public string? Specialty { get; set; }
        public string? ProfilePictureUrl { get; set; } } }