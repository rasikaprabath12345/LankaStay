using System;
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
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        [Authorize(Roles = "Tourist")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto createDto)
        {
            var touristIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(touristIdStr) || !Guid.TryParse(touristIdStr, out var touristId))
            {
                return Unauthorized("Invalid tourist identification.");
            }

            var booking = await _bookingService.CreateBookingAsync(createDto, touristId);
            return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, booking);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingById(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleStr = User.FindFirstValue(ClaimTypes.Role);
            
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId) || string.IsNullOrEmpty(roleStr))
            {
                return Unauthorized("Invalid identity context.");
            }

            var booking = await _bookingService.GetBookingByIdAsync(id, userId, roleStr);
            if (booking == null)
            {
                return NotFound($"Booking with ID {id} not found.");
            }
            return Ok(booking);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserBookings()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleStr = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId) || string.IsNullOrEmpty(roleStr))
            {
                return Unauthorized("Invalid identity context.");
            }

            var bookings = await _bookingService.GetUserBookingsAsync(userId, roleStr);
            return Ok(bookings);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] UpdateBookingStatusDto statusDto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleStr = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId) || string.IsNullOrEmpty(roleStr))
            {
                return Unauthorized("Invalid identity context.");
            }

            var result = await _bookingService.UpdateBookingStatusAsync(id, statusDto.Status, userId, roleStr);
            return Ok(new { success = result, message = $"Booking status successfully updated to {statusDto.Status}." });
        }

        [HttpPost("review")]
        [Authorize(Roles = "Tourist")]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto reviewDto)
        {
            var touristIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(touristIdStr) || !Guid.TryParse(touristIdStr, out var touristId))
            {
                return Unauthorized("Invalid tourist identification.");
            }

            var review = await _bookingService.AddReviewAsync(reviewDto, touristId);
            return Ok(review);
        }

        [HttpGet("calculate-price")]
        [AllowAnonymous]
        public async Task<IActionResult> CalculatePrice([FromQuery] Guid experienceId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int guestCount)
        {
            var totalPrice = await _bookingService.CalculateBookingPriceAsync(experienceId, startDate, endDate, guestCount);
            return Ok(new { totalPrice });
        }
    }
}
