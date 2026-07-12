using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LankaStay.Application.Interfaces;
using LankaStay.Domain.Entities;
using LankaStay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LankaStay.Infrastructure.Repositories
{
    public class ExperienceRepository : Repository<Experience>, IExperienceRepository
    {
        public ExperienceRepository(LankaStayDbContext context) : base(context)
        {
        }

        public async Task<Experience?> GetExperienceWithDetailsAsync(Guid id)
        {
            return await Context.Experiences
                .Include(e => e.Host)
                .Include(e => e.ExperienceTags)
                    .ThenInclude(et => et.Tag)
                .Include(e => e.PeakSeasons)
                .Include(e => e.Bookings)
                    .ThenInclude(b => b.Review)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<Experience>> GetExperiencesWithDetailsAsync(string? location, List<Guid>? tagIds)
        {
            var query = Context.Experiences
                .Include(e => e.Host)
                .Include(e => e.ExperienceTags)
                    .ThenInclude(et => et.Tag)
                .Include(e => e.PeakSeasons)
                .Include(e => e.Bookings)
                    .ThenInclude(b => b.Review)
                .Where(e => e.IsActive && e.Host.IsVerified); // Only show active experiences from verified hosts

            if (!string.IsNullOrWhiteSpace(location))
            {
                query = query.Where(e => e.Location.ToLower().Contains(location.ToLower()));
            }

            if (tagIds != null && tagIds.Any())
            {
                // Experience must match ALL selected tags (strict constraint matchmaking)
                foreach (var tagId in tagIds)
                {
                    query = query.Where(e => e.ExperienceTags.Any(et => et.TagId == tagId));
                }
            }

            return await query.OrderByDescending(e => e.CreatedAt).ToListAsync();
        }
    }
}
