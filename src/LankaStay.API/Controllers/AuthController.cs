using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using LankaStay.Application.DTOs;
using LankaStay.Application.Interfaces;
using LankaStay.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LankaStay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("verify-host/{id}")]
        public async Task<IActionResult> VerifyHost(Guid id, [FromBody] HostVerificationDto verificationDto)
        {
            if (id != verificationDto.UserId)
            {
                return BadRequest("User ID mismatch in request body.");
            }

            var result = await _authService.VerifyHostAsync(id, verificationDto.IsVerified);
            return Ok(new { success = result, message = $"Host verification status updated to {verificationDto.IsVerified}." });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("unverified-hosts")]
        public async Task<IActionResult> GetUnverifiedHosts()
        {
            var result = await _authService.GetUnverifiedHostsAsync();
            return Ok(result);
        }

        // Endpoint to fetch current user's profile metadata based on token context
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUserProfile([FromServices] IUnitOfWork unitOfWork)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var user = await unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized("User no longer exists in database.");
            }

            return Ok(new
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                IsVerified = user.IsVerified
            });
        }
    }
}
