using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using LankaStay.Application.DTOs;
using LankaStay.Application.Interfaces;
using LankaStay.Domain.Entities;
using LankaStay.Domain.Enums;

namespace LankaStay.Application.Services
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public BookingService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BookingDto> CreateBookingAsync(CreateBookingDto createDto, Guid touristId)
        {
            var experience = await _unitOfWork.Experiences.GetExperienceWithDetailsAsync(createDto.ExperienceId);
            if (experience == null)
            {
                throw new Exception("Experience not found.");
            }

            if (!experience.IsActive || !experience.Host.IsVerified)
            {
                throw new Exception("This experience is currently unavailable for booking.");
            }

            if (createDto.StartDate.Date < DateTime.UtcNow.Date)
            {
                throw new Exception("Check-in date cannot be in the past.");
            }

            if (createDto.EndDate.Date <= createDto.StartDate.Date)
            {
                throw new Exception("Check-out date must be after the check-in date.");
            }

            // Calculate dynamic price
            var totalBasePrice = await CalculateBookingPriceAsync(experience.Id, createDto.StartDate, createDto.EndDate, 1); // Get single guest price
            var totalPrice = totalBasePrice * createDto.GuestCount;

            var booking = new Booking
            {
                ExperienceId = createDto.ExperienceId,
                TouristId = touristId,
                GuestCount = createDto.GuestCount,
                StartDate = createDto.StartDate.Date,
                EndDate = createDto.EndDate.Date,
                BasePrice = totalBasePrice / (decimal)(createDto.EndDate.Date - createDto.StartDate.Date).TotalDays, // Average nightly base price
                TotalPrice = totalPrice,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Bookings.AddAsync(booking);
            await _unitOfWork.CompleteAsync();

            // Return created booking details
            var savedBooking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(booking.Id);
            return _mapper.Map<BookingDto>(savedBooking!);
        }

        public async Task<BookingDto?> GetBookingByIdAsync(Guid id, Guid userId, string role)
        {
            var booking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(id);
            if (booking == null) return null;

            // Authorization: Tourist, Host of Experience, or Admin
            if (role != UserRole.Admin.ToString() && 
                booking.TouristId != userId && 
                booking.Experience.HostId != userId)
            {
                throw new Exception("Unauthorized: You do not have permission to view this booking.");
            }

            return _mapper.Map<BookingDto>(booking);
        }

        public async Task<IEnumerable<BookingDto>> GetUserBookingsAsync(Guid userId, string role)
        {
            IEnumerable<Booking> bookings;

            if (role == UserRole.Host.ToString())
            {
                bookings = await _unitOfWork.Bookings.GetBookingsByHostIdAsync(userId);
            }
            else if (role == UserRole.Admin.ToString())
            {
                bookings = await _unitOfWork.Bookings.GetAllAsync();
            }
            else
            {
                bookings = await _unitOfWork.Bookings.GetBookingsByTouristIdAsync(userId);
            }

            return _mapper.Map<IEnumerable<BookingDto>>(bookings);
        }

        public async Task<bool> UpdateBookingStatusAsync(Guid bookingId, BookingStatus status, Guid userId, string role)
        {
            var booking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(bookingId);
            if (booking == null)
            {
                throw new Exception("Booking not found.");
            }

            var previousStatus = booking.Status;

            // State Machine Guard & Authorization
            if (role == UserRole.Tourist.ToString())
            {
                // Tourists can only cancel bookings that are Pending or Confirmed
                if (booking.TouristId != userId)
                {
                    throw new Exception("Unauthorized: This is not your booking.");
                }

                if (status != BookingStatus.Cancelled)
                {
                    throw new Exception("Tourist can only transition status to Cancelled.");
                }

                if (previousStatus != BookingStatus.Pending && previousStatus != BookingStatus.Confirmed)
                {
                    throw new Exception("Cannot cancel booking. It is already active, completed, or cancelled.");
                }
            }
            else if (role == UserRole.Host.ToString())
            {
                if (booking.Experience.HostId != userId)
                {
                    throw new Exception("Unauthorized: You do not host this experience.");
                }

                // Host Transitions: 
                // Pending -> Confirmed OR Cancelled
                // Confirmed -> Active (Check-in) OR Cancelled
                // Active -> Completed
                if (previousStatus == BookingStatus.Pending)
                {
                    if (status != BookingStatus.Confirmed && status != BookingStatus.Cancelled)
                    {
                        throw new Exception("Pending bookings can only be Confirmed or Cancelled.");
                    }
                }
                else if (previousStatus == BookingStatus.Confirmed)
                {
                    if (status != BookingStatus.Active && status != BookingStatus.Cancelled)
                    {
                        throw new Exception("Confirmed bookings can only be set to Active (Checked-in) or Cancelled.");
                    }
                }
                else if (previousStatus == BookingStatus.Active)
                {
                    if (status != BookingStatus.Completed)
                    {
                        throw new Exception("Active bookings can only be set to Completed.");
                    }
                }
                else
                {
                    throw new Exception($"Cannot transition booking from {previousStatus} to {status}.");
                }
            }
            else if (role != UserRole.Admin.ToString())
            {
                throw new Exception("Unauthorized role.");
            }

            // Apply new state
            booking.Status = status;
            booking.UpdatedAt = DateTime.UtcNow;

            // Escrow Payment Calculations on Completed state
            if (status == BookingStatus.Completed)
            {
                var payment = booking.Payment;
                if (payment == null)
                {
                    payment = new Payment
                    {
                        BookingId = booking.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Payments.AddAsync(payment);
                }

                payment.Amount = booking.TotalPrice;
                payment.PlatformCommission = booking.TotalPrice * 0.10m; // 10% Platform fee
                payment.HostEarnings = booking.TotalPrice * 0.90m;       // 90% Host payout
                payment.Status = PaymentStatus.Completed;
                payment.PayoutStatus = PayoutStatus.Pending;
                payment.ProcessedAt = DateTime.UtcNow;
            }
            else if (status == BookingStatus.Cancelled)
            {
                if (booking.Payment != null)
                {
                    booking.Payment.Status = PaymentStatus.Refunded;
                    booking.Payment.ProcessedAt = DateTime.UtcNow;
                }
            }
            else if (status == BookingStatus.Confirmed)
            {
                // Create pending payment log
                if (booking.Payment == null)
                {
                    var payment = new Payment
                    {
                        BookingId = booking.Id,
                        Amount = booking.TotalPrice,
                        PlatformCommission = booking.TotalPrice * 0.10m,
                        HostEarnings = booking.TotalPrice * 0.90m,
                        Status = PaymentStatus.Pending,
                        PayoutStatus = PayoutStatus.Pending,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Payments.AddAsync(payment);
                }
            }

            _unitOfWork.Bookings.Update(booking);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<ReviewDto> AddReviewAsync(CreateReviewDto reviewDto, Guid touristId)
        {
            var booking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(reviewDto.BookingId);
            if (booking == null)
            {
                throw new Exception("Booking not found.");
            }

            if (booking.TouristId != touristId)
            {
                throw new Exception("Unauthorized: You did not make this booking.");
            }

            if (booking.Status != BookingStatus.Completed)
            {
                throw new Exception("Cannot review a booking that is not completed.");
            }

            if (booking.Review != null)
            {
                throw new Exception("You have already reviewed this booking.");
            }

            var review = new Review
            {
                BookingId = reviewDto.BookingId,
                TouristId = touristId,
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Reviews.AddAsync(review);
            await _unitOfWork.CompleteAsync();

            var savedReview = await _unitOfWork.Reviews.GetByIdAsync(review.Id);
            // Attach tourist details for return DTO mapping
            savedReview!.Tourist = await _unitOfWork.Users.GetByIdAsync(touristId) ?? null!;
            return _mapper.Map<ReviewDto>(savedReview);
        }

        public async Task<decimal> CalculateBookingPriceAsync(Guid experienceId, DateTime startDate, DateTime endDate, int guestCount)
        {
            var experience = await _unitOfWork.Experiences.GetExperienceWithDetailsAsync(experienceId);
            if (experience == null)
            {
                throw new Exception("Experience not found.");
            }

            decimal totalBasePrice = 0;
            var days = (endDate.Date - startDate.Date).Days;
            
            if (days <= 0) return 0;

            for (int i = 0; i < days; i++)
            {
                var currentDate = startDate.Date.AddDays(i);
                
                // Check if this date falls into any active Peak Seasons
                var activePeakSeason = experience.PeakSeasons
                    .FirstOrDefault(ps => currentDate >= ps.StartDate.Date && currentDate <= ps.EndDate.Date);

                if (activePeakSeason != null)
                {
                    totalBasePrice += experience.BasePrice * activePeakSeason.SeasonalMultiplier;
                }
                else
                {
                    totalBasePrice += experience.BasePrice;
                }
            }

            return totalBasePrice * guestCount;
        }
    }
}
