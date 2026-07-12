using System;
using System.Threading.Tasks;
using LankaStay.Domain.Entities;

namespace LankaStay.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IExperienceRepository Experiences { get; }
        IBookingRepository Bookings { get; }
        IRepository<Tag> Tags { get; }
        IRepository<Payment> Payments { get; }
        IRepository<Review> Reviews { get; }
        IRepository<PeakSeason> PeakSeasons { get; }
        
        Task<int> CompleteAsync();
    }
}
