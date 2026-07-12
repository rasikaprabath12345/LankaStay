using System;
using System.Threading.Tasks;
using LankaStay.Application.Interfaces;
using LankaStay.Domain.Entities;
using LankaStay.Infrastructure.Data;

namespace LankaStay.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly LankaStayDbContext _context;

        public IUserRepository Users { get; }
        public IExperienceRepository Experiences { get; }
        public IBookingRepository Bookings { get; }
        public IRepository<Tag> Tags { get; }
        public IRepository<Payment> Payments { get; }
        public IRepository<Review> Reviews { get; }
        public IRepository<PeakSeason> PeakSeasons { get; }

        public UnitOfWork(LankaStayDbContext context)
        {
            _context = context;
            
            Users = new UserRepository(_context);
            Experiences = new ExperienceRepository(_context);
            Bookings = new BookingRepository(_context);
            Tags = new Repository<Tag>(_context);
            Payments = new Repository<Payment>(_context);
            Reviews = new Repository<Review>(_context);
            PeakSeasons = new Repository<PeakSeason>(_context);
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
