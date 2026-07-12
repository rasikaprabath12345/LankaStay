using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LankaStay.Domain.Entities;

namespace LankaStay.Application.Interfaces
{
    public interface IExperienceRepository : IRepository<Experience>
    {
        Task<Experience?> GetExperienceWithDetailsAsync(Guid id);
        Task<IEnumerable<Experience>> GetExperiencesWithDetailsAsync(string? location, List<Guid>? tagIds);
    }
}
