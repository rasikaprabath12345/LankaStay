using System;

namespace LankaStay.Domain.Entities
{
    public class Review
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid BookingId { get; set; }
        public virtual Booking Booking { get; set; } = null!;

        public Guid TouristId { get; set; }
        public virtual User Tourist { get; set; } = null!;

        public int Rating { get; set; } // 1-5 Stars
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
