using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LankaStay.Application.Interfaces;
using LankaStay.Domain.Entities;
using LankaStay.Domain.Enums;
using LankaStay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LankaStay.Infrastructure.Repositories
{
    public class BookingRepository : Repository<Booking>, IBookingRepository
    {
        public BookingRepository(LankaStayDbContext context) : base(context)
        {
        }

        public async Task<Booking?> GetBookingWithDetailsAsync(Guid id)
        {
            return await Context.Bookings
                .Include(b => b.Tourist)
                .Include(b => b.Experience)
                    .ThenInclude(e => e.Host)
                .Include(b => b.Payment)
                .Include(b => b.Review)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetBookingsByTouristIdAsync(Guid touristId)
        {
            return await Context.Bookings
                .Include(b => b.Experience)
                    .ThenInclude(e => e.Host)
                .Include(b => b.Payment)
                .Include(b => b.Review)
                .Where(b => b.TouristId == touristId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByHostIdAsync(Guid hostId)
        {
            return await Context.Bookings
                .Include(b => b.Tourist)
                .Include(b => b.Experience)
                .Include(b => b.Payment)
                .Include(b => b.Review)
                .Where(b => b.Experience.HostId == hostId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetPendingBookingsOlderThan48HoursAsync()
        {
            var thresholdTime = DateTime.UtcNow.AddHours(-48);
            return await Context.Bookings
                .Where(b => b.Status == BookingStatus.Pending && b.CreatedAt <= thresholdTime)
                .ToListAsync();
        }
    }
}
