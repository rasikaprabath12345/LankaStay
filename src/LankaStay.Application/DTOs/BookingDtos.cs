using System;
using LankaStay.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace LankaStay.Application.DTOs
{
    public class BookingDto
    {
        public Guid Id { get; set; }
        public Guid ExperienceId { get; set; }
        public string ExperienceTitle { get; set; } = string.Empty;
        public string ExperienceLocation { get; set; } = string.Empty;

        public Guid TouristId { get; set; }
        public string TouristName { get; set; } = string.Empty;
        public string TouristEmail { get; set; } = string.Empty;

        public int GuestCount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public decimal BasePrice { get; set; }
        public decimal TotalPrice { get; set; }

        public BookingStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public PaymentDto? Payment { get; set; }
        public ReviewDto? Review { get; set; }
    }

    public class CreateBookingDto
    {
        [Required]
        public Guid ExperienceId { get; set; }

        [Required, Range(1, 20)]
        public int GuestCount { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }

    public class UpdateBookingStatusDto
    {
        [Required]
        public BookingStatus Status { get; set; }
    }
}
