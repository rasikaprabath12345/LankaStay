using System.Collections.Generic;
using System.Threading.Tasks;
using LankaStay.Domain.Entities;

namespace LankaStay.Application.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetUnverifiedHostsAsync();
    }
}
