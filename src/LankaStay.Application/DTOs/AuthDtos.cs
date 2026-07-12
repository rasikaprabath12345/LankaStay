using LankaStay.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace LankaStay.Application.DTOs
{
    public class RegisterDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.Tourist;

        // Optional parameters for Host Verification upload
        public string? GramaNiladhariClearanceUrl { get; set; }
        public string? PoliceClearanceUrl { get; set; }
    }

    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public string Id { get; set; } = string.Empty;
    }

    public class HostVerificationDto
    {
        public Guid UserId { get; set; }
        public bool IsVerified { get; set; }
    }
}
