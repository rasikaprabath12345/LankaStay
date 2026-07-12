using System;
using System.Collections.Generic;
using LankaStay.Domain.Enums;

namespace LankaStay.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Tourist;

        // Strict Verification Logic for Hosts
        public bool IsVerified { get; set; } = false;
        public string? GramaNiladhariClearanceUrl { get; set; }
        public string? PoliceClearanceUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public virtual ICollection<Experience> Experiences { get; set; } = new List<Experience>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
