using LankaStay.Domain.Entities;

namespace LankaStay.Application.Interfaces
{
    public interface IJwtProvider
    {
        string GenerateToken(User user);
    }
}
