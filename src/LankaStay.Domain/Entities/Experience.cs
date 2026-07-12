using System;
using System.Collections.Generic;

namespace LankaStay.Domain.Entities
{
    public class Experience
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string Location { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public string ImageUrl { get; set; } = string.Empty;

        public Guid HostId { get; set; }
        public virtual User Host { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public virtual ICollection<ExperienceTag> ExperienceTags { get; set; } = new List<ExperienceTag>();
        public virtual ICollection<PeakSeason> PeakSeasons { get; set; } = new List<PeakSeason>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
