using System;
using LankaStay.Domain.Enums;

namespace LankaStay.Domain.Entities
{
    public class Payment
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid BookingId { get; set; }
        public virtual Booking Booking { get; set; } = null!;

        public decimal Amount { get; set; }
        public decimal PlatformCommission { get; set; } // 10%
        public decimal HostEarnings { get; set; }       // 90%

        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        public PayoutStatus PayoutStatus { get; set; } = PayoutStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ProcessedAt { get; set; }
    }
}
