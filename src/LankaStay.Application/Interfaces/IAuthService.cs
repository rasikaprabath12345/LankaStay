using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LankaStay.Application.DTOs;

namespace LankaStay.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<bool> VerifyHostAsync(Guid hostId, bool isVerified);
        Task<IEnumerable<AuthResponseDto>> GetUnverifiedHostsAsync();
    }
}
