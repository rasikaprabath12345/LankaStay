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
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(LankaStayDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await Context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<User>> GetUnverifiedHostsAsync()
        {
            return await Context.Users
                .Where(u => u.Role == UserRole.Host && !u.IsVerified)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }
    }
}
