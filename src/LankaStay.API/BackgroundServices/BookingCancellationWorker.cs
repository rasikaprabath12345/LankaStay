using System;
using System.Threading;
using System.Threading.Tasks;
using LankaStay.Application.Interfaces;
using LankaStay.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LankaStay.API.BackgroundServices
{
    public class BookingCancellationWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BookingCancellationWorker> _logger;

        public BookingCancellationWorker(IServiceProvider serviceProvider, ILogger<BookingCancellationWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Booking Auto-Cancellation Worker started.");

            // Run check every hour
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CancelStalePendingBookingsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while executing auto-cancellation check.");
                }

                // Wait 1 hour before next execution (or shorter for testing/demonstration, e.g. 1 hour is standard)
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }

            _logger.LogInformation("Booking Auto-Cancellation Worker is stopping.");
        }

        private async Task CancelStalePendingBookingsAsync()
        {
            _logger.LogInformation("Checking for pending bookings older than 48 hours...");

            using (var scope = _serviceProvider.CreateScope())
            {
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var staleBookings = await unitOfWork.Bookings.GetPendingBookingsOlderThan48HoursAsync();

                var staleList = staleBookings.ToList();
                if (staleList.Any())
                {
                    _logger.LogInformation("Found {Count} stale pending bookings to cancel.", staleList.Count);

                    foreach (var booking in staleList)
                    {
                        _logger.LogInformation("Auto-cancelling Booking ID: {BookingId} created at {CreatedAt}.", booking.Id, booking.CreatedAt);
                        booking.Status = BookingStatus.Cancelled;
                        booking.UpdatedAt = DateTime.UtcNow;
                        unitOfWork.Bookings.Update(booking);
                    }

                    int results = await unitOfWork.CompleteAsync();
                    _logger.LogInformation("Successfully cancelled stale bookings. Rows affected: {Rows}.", results);
                }
                else
                {
                    _logger.LogInformation("No stale pending bookings found.");
                }
            }
        }
    }
}
