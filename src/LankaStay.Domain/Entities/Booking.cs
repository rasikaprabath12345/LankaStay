using System;
using LankaStay.Domain.Enums;

namespace LankaStay.Domain.Entities
{
    public class Booking
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid ExperienceId { get; set; }
        public virtual Experience Experience { get; set; } = null!;

        public Guid TouristId { get; set; }
        public virtual User Tourist { get; set; } = null!;

        public int GuestCount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public decimal BasePrice { get; set; } // Price locked in at time of booking (seasonal adjusted if applicable)
        public decimal TotalPrice { get; set; } // BasePrice * GuestCount * Nights (or days depending on homestay vs experience details)

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public virtual Payment? Payment { get; set; }
        public virtual Review? Review { get; set; }
    }
}
