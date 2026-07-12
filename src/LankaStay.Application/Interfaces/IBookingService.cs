using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LankaStay.Application.DTOs;
using LankaStay.Domain.Enums;

namespace LankaStay.Application.Interfaces
{
    public interface IBookingService
    {
        Task<BookingDto> CreateBookingAsync(CreateBookingDto createDto, Guid touristId);
        Task<BookingDto?> GetBookingByIdAsync(Guid id, Guid userId, string role);
        Task<IEnumerable<BookingDto>> GetUserBookingsAsync(Guid userId, string role);
        Task<bool> UpdateBookingStatusAsync(Guid bookingId, BookingStatus status, Guid userId, string role);
        Task<ReviewDto> AddReviewAsync(CreateReviewDto reviewDto, Guid touristId);
        Task<decimal> CalculateBookingPriceAsync(Guid experienceId, DateTime startDate, DateTime endDate, int guestCount);
    }
}
