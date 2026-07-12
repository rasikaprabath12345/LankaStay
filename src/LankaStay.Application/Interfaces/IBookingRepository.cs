using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LankaStay.Domain.Entities;

namespace LankaStay.Application.Interfaces
{
    public interface IBookingRepository : IRepository<Booking>
    {
        Task<Booking?> GetBookingWithDetailsAsync(Guid id);
        Task<IEnumerable<Booking>> GetBookingsByTouristIdAsync(Guid touristId);
        Task<IEnumerable<Booking>> GetBookingsByHostIdAsync(Guid hostId);
        Task<IEnumerable<Booking>> GetPendingBookingsOlderThan48HoursAsync();
    }
}
