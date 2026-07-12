using System;
using LankaStay.Domain.Enums;

namespace LankaStay.Application.DTOs
{
    public class PaymentDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public decimal Amount { get; set; }
        public decimal PlatformCommission { get; set; }
        public decimal HostEarnings { get; set; }
        public PaymentStatus Status { get; set; }
        public PayoutStatus PayoutStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
    }
}
