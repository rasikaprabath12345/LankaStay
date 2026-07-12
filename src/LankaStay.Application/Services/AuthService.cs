using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LankaStay.Application.DTOs;
using LankaStay.Application.Interfaces;
using LankaStay.Domain.Entities;
using LankaStay.Domain.Enums;

namespace LankaStay.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtProvider _jwtProvider;

        public AuthService(IUnitOfWork unitOfWork, IJwtProvider jwtProvider)
        {
            _unitOfWork = unitOfWork;
            _jwtProvider = jwtProvider;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            // Check email uniqueness
            var existingUser = await _unitOfWork.Users.GetByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                throw new Exception("Email is already registered.");
            }

            // Create new user
            var user = new User
            {
                Email = registerDto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                FullName = registerDto.FullName,
                Role = registerDto.Role,
                IsVerified = registerDto.Role != UserRole.Host, // Only hosts start as unverified
                GramaNiladhariClearanceUrl = registerDto.Role == UserRole.Host ? registerDto.GramaNiladhariClearanceUrl : null,
                PoliceClearanceUrl = registerDto.Role == UserRole.Host ? registerDto.PoliceClearanceUrl : null,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            var token = _jwtProvider.GenerateToken(user);

            return new AuthResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                IsVerified = user.IsVerified,
                Token = token
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                throw new Exception("Invalid email or password.");
            }

            var token = _jwtProvider.GenerateToken(user);

            return new AuthResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                IsVerified = user.IsVerified,
                Token = token
            };
        }

        public async Task<bool> VerifyHostAsync(Guid hostId, bool isVerified)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(hostId);
            if (user == null || user.Role != UserRole.Host)
            {
                throw new Exception("Host not found.");
            }

            user.IsVerified = isVerified;
            user.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<IEnumerable<AuthResponseDto>> GetUnverifiedHostsAsync()
        {
            var hosts = await _unitOfWork.Users.GetUnverifiedHostsAsync();
            return hosts.Select(h => new AuthResponseDto
            {
                Id = h.Id.ToString(),
                Email = h.Email,
                FullName = h.FullName,
                Role = h.Role.ToString(),
                IsVerified = h.IsVerified,
                Token = string.Empty
            });
        }
    }
}
