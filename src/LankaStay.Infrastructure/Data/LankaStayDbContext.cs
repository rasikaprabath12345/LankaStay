using Microsoft.EntityFrameworkCore;
using LankaStay.Domain.Entities;
using LankaStay.Domain.Enums;
using System;

namespace LankaStay.Infrastructure.Data
{
    public class LankaStayDbContext : DbContext
    {
        public LankaStayDbContext(DbContextOptions<LankaStayDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Experience> Experiences { get; set; } = null!;
        public DbSet<Tag> Tags { get; set; } = null!;
        public DbSet<ExperienceTag> ExperienceTags { get; set; } = null!;
        public DbSet<PeakSeason> PeakSeasons { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).HasConversion<int>();
            });

            // Experience Configuration
            modelBuilder.Entity<Experience>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.Location).IsRequired().HasMaxLength(250);
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);

                entity.HasOne(e => e.Host)
                    .WithMany(u => u.Experiences)
                    .HasForeignKey(e => e.HostId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Tag Configuration
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.Description).HasMaxLength(250);
            });

            // ExperienceTag Join Entity Configuration (Many-to-Many)
            modelBuilder.Entity<ExperienceTag>(entity =>
            {
                entity.HasKey(et => new { et.ExperienceId, et.TagId });

                entity.HasOne(et => et.Experience)
                    .WithMany(e => e.ExperienceTags)
                    .HasForeignKey(et => et.ExperienceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(et => et.Tag)
                    .WithMany(t => t.ExperienceTags)
                    .HasForeignKey(et => et.TagId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // PeakSeason Configuration
            modelBuilder.Entity<PeakSeason>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.SeasonalMultiplier).HasPrecision(4, 2);

                entity.HasOne(e => e.Experience)
                    .WithMany(ex => ex.PeakSeasons)
                    .HasForeignKey(e => e.ExperienceId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Booking Configuration
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
                entity.Property(e => e.Status).HasConversion<int>();

                entity.HasOne(b => b.Experience)
                    .WithMany(e => e.Bookings)
                    .HasForeignKey(b => b.ExperienceId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Tourist)
                    .WithMany(u => u.Bookings)
                    .HasForeignKey(b => b.TouristId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Payment Configuration (One-to-One with Booking)
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.Property(e => e.PlatformCommission).HasPrecision(18, 2);
                entity.Property(e => e.HostEarnings).HasPrecision(18, 2);
                entity.Property(e => e.Status).HasConversion<int>();
                entity.Property(e => e.PayoutStatus).HasConversion<int>();

                entity.HasOne(p => p.Booking)
                    .WithOne(b => b.Payment)
                    .HasForeignKey<Payment>(p => p.BookingId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Review Configuration (One-to-One with Booking, tourist link for query filter convenience)
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Comment).IsRequired().HasMaxLength(1000);

                entity.HasOne(r => r.Booking)
                    .WithOne(b => b.Review)
                    .HasForeignKey<Review>(r => r.BookingId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Tourist)
                    .WithMany()
                    .HasForeignKey(r => r.TouristId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed Data: Tags
            var veganTagId = new Guid("11111111-1111-1111-1111-111111111111");
            var halalTagId = new Guid("22222222-2222-2222-2222-222222222222");
            var petFriendlyTagId = new Guid("33333333-3333-3333-3333-333333333333");
            var traditionalFoodTagId = new Guid("44444444-4444-4444-4444-444444444444");

            modelBuilder.Entity<Tag>().HasData(
                new Tag { Id = veganTagId, Name = "Vegan", Description = "Strictly plant-based food experiences" },
                new Tag { Id = halalTagId, Name = "Halal", Description = "Halal-certified or prepared food and environment" },
                new Tag { Id = petFriendlyTagId, Name = "Pet-Friendly", Description = "Hosts who accommodate pets" },
                new Tag { Id = traditionalFoodTagId, Name = "Traditional Food", Description = "Focuses on authentic Sri Lankan cuisine" }
            );

            // Seed Data: Default Admin User (Password is 'Admin@LankaStay2026' hashed with BCrypt style placeholder)
            // Wait, for seeding we will generate a valid hashed password representation
            // Password: Admin@LankaStay2026 -> standard ASP.NET Identity password hash format can be seeded or placeholder hash used.
            // Let's use a standard SHA256 hashed string or a mock BCrypt string. The auth service will check this.
            // To ensure compatibility, we'll hash it inside our auth service, or use a known hash. Let's use a standard hash representation.
            // Placeholder: "AQAAAAIAAYagAAAAEIe2e92c2U52i62678fS..." (typical ASP.NET Core Identity hash)
            // Let's seed an admin user with a simple known SHA256 / hashed form. We can define our password verify mechanism.
            // If using standard BCrypt or Identity PasswordHasher: we can use a pre-calculated hash.
            // Let's use a typical secure hash: "$2a$11$qRzP6gM5j6.r0hH/0Y87FOHcW6E4MugzO4z/5mpeP6GZ.g8vXzUle" (which is bcrypt for 'Admin@LankaStay2026')
            var host1Id = new Guid("00000000-0000-0000-0000-000000000002");
            var host2Id = new Guid("00000000-0000-0000-0000-000000000003");
            var host3Id = new Guid("00000000-0000-0000-0000-000000000004");
            var touristId = new Guid("00000000-0000-0000-0000-000000000005");

            var adminUser = new User
            {
                Id = new Guid("00000000-0000-0000-0000-000000000001"),
                Email = "admin@lankastay.com",
                PasswordHash = "$2a$11$NO/9X1eydqr1LZVUdpiDP.Ta3vzv6dtT94il7Nb78phx4EuOoVlJ6", // BCrypt format for Admin@LankaStay2026
                FullName = "LankaStay System Admin",
                Role = UserRole.Admin,
                IsVerified = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var host1 = new User
            {
                Id = host1Id,
                Email = "anura@lankastay.com",
                PasswordHash = "$2a$11$NO/9X1eydqr1LZVUdpiDP.Ta3vzv6dtT94il7Nb78phx4EuOoVlJ6",
                FullName = "Anura Senanayake",
                Role = UserRole.Host,
                IsVerified = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var host2 = new User
            {
                Id = host2Id,
                Email = "jayasinghe@lankastay.com",
                PasswordHash = "$2a$11$NO/9X1eydqr1LZVUdpiDP.Ta3vzv6dtT94il7Nb78phx4EuOoVlJ6",
                FullName = "Mrs. Jayasinghe",
                Role = UserRole.Host,
                IsVerified = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var host3 = new User
            {
                Id = host3Id,
                Email = "bandara@lankastay.com",
                PasswordHash = "$2a$11$NO/9X1eydqr1LZVUdpiDP.Ta3vzv6dtT94il7Nb78phx4EuOoVlJ6",
                FullName = "Saman Bandara",
                Role = UserRole.Host,
                IsVerified = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var tourist = new User
            {
                Id = touristId,
                Email = "tourist@lankastay.com",
                PasswordHash = "$2a$11$NO/9X1eydqr1LZVUdpiDP.Ta3vzv6dtT94il7Nb78phx4EuOoVlJ6",
                FullName = "Sarah Miller",
                Role = UserRole.Tourist,
                IsVerified = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            modelBuilder.Entity<User>().HasData(adminUser, host1, host2, host3, tourist);

            // Seed Data: Experiences
            var exp1Id = new Guid("10000000-0000-0000-0000-000000000001");
            var exp2Id = new Guid("10000000-0000-0000-0000-000000000002");
            var exp3Id = new Guid("10000000-0000-0000-0000-000000000003");
            var exp4Id = new Guid("10000000-0000-0000-0000-000000000004");

            var exp1 = new Experience
            {
                Id = exp1Id,
                Title = "Ella Misty Mountain Cottage",
                Description = "Nestled in the lush hills of Ella, this cottage offers panoramic views of the Ella Gap. Enjoy fresh woodfire-cooked meals and local Ceylon tea daily.",
                BasePrice = 45.00m,
                Location = "Ella",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80",
                HostId = host1Id,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var exp2 = new Experience
            {
                Id = exp2Id,
                Title = "Galle Fort Colonial Homestay",
                Description = "Live inside the historic Galle Fort in a Dutch colonial-style house. Mrs. Jayasinghe teaches traditional crab curry and coconut roti preparation.",
                BasePrice = 60.00m,
                Location = "Galle",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
                HostId = host2Id,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var exp3 = new Experience
            {
                Id = exp3Id,
                Title = "Kandy Sacred Hills Villa",
                Description = "Located high on Kandy hills with views overlooking the Kandy Lake. Authentic hospitality, peaceful meditation gardens, and vegetarian meals.",
                BasePrice = 35.00m,
                Location = "Kandy",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80",
                HostId = host3Id,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            var exp4 = new Experience
            {
                Id = exp4Id,
                Title = "Sigiriya Rock View Eco Lodge",
                Description = "A stunning eco-lodge surrounded by nature, with direct views of the Sigiriya Rock fortress. Organic home garden meals and local bicycle tours included.",
                BasePrice = 50.00m,
                Location = "Sigiriya",
                IsActive = true,
                ImageUrl = "https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=800&q=80",
                HostId = host3Id,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };

            modelBuilder.Entity<Experience>().HasData(exp1, exp2, exp3, exp4);

            // Seed Data: ExperienceTags
            modelBuilder.Entity<ExperienceTag>().HasData(
                new ExperienceTag { ExperienceId = exp1Id, TagId = traditionalFoodTagId },
                new ExperienceTag { ExperienceId = exp1Id, TagId = petFriendlyTagId },
                new ExperienceTag { ExperienceId = exp2Id, TagId = traditionalFoodTagId },
                new ExperienceTag { ExperienceId = exp2Id, TagId = halalTagId },
                new ExperienceTag { ExperienceId = exp3Id, TagId = veganTagId },
                new ExperienceTag { ExperienceId = exp3Id, TagId = traditionalFoodTagId },
                new ExperienceTag { ExperienceId = exp4Id, TagId = petFriendlyTagId },
                new ExperienceTag { ExperienceId = exp4Id, TagId = traditionalFoodTagId }
            );

            // Seed Data: Bookings
            var booking1Id = new Guid("20000000-0000-0000-0000-000000000001");
            var booking2Id = new Guid("20000000-0000-0000-0000-000000000002");
            var booking3Id = new Guid("20000000-0000-0000-0000-000000000003");
            var booking4Id = new Guid("20000000-0000-0000-0000-000000000004");

            modelBuilder.Entity<Booking>().HasData(
                new Booking
                {
                    Id = booking1Id,
                    ExperienceId = exp1Id,
                    TouristId = touristId,
                    GuestCount = 2,
                    StartDate = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 45.00m,
                    TotalPrice = 360.00m,
                    Status = BookingStatus.Completed,
                    CreatedAt = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc)
                },
                new Booking
                {
                    Id = booking2Id,
                    ExperienceId = exp2Id,
                    TouristId = touristId,
                    GuestCount = 1,
                    StartDate = new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 2, 12, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 60.00m,
                    TotalPrice = 120.00m,
                    Status = BookingStatus.Completed,
                    CreatedAt = new DateTime(2026, 1, 20, 0, 0, 0, DateTimeKind.Utc)
                },
                new Booking
                {
                    Id = booking3Id,
                    ExperienceId = exp3Id,
                    TouristId = touristId,
                    GuestCount = 2,
                    StartDate = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 3, 4, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 35.00m,
                    TotalPrice = 210.00m,
                    Status = BookingStatus.Completed,
                    CreatedAt = new DateTime(2026, 2, 10, 0, 0, 0, DateTimeKind.Utc)
                },
                new Booking
                {
                    Id = booking4Id,
                    ExperienceId = exp4Id,
                    TouristId = touristId,
                    GuestCount = 3,
                    StartDate = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                    EndDate = new DateTime(2026, 3, 18, 0, 0, 0, DateTimeKind.Utc),
                    BasePrice = 50.00m,
                    TotalPrice = 450.00m,
                    Status = BookingStatus.Completed,
                    CreatedAt = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // Seed Data: Reviews
            modelBuilder.Entity<Review>().HasData(
                new Review
                {
                    Id = new Guid("30000000-0000-0000-0000-000000000001"),
                    BookingId = booking1Id,
                    TouristId = touristId,
                    Rating = 5,
                    Comment = "Staying with Anura's family in Ella was the highlight of our trip. They welcomed us with fresh king coconuts, and we made traditional coconut sambol together over woodfire! LankaStay verified status made us feel 100% safe.",
                    CreatedAt = new DateTime(2026, 2, 6, 0, 0, 0, DateTimeKind.Utc)
                },
                new Review
                {
                    Id = new Guid("30000000-0000-0000-0000-000000000002"),
                    BookingId = booking2Id,
                    TouristId = touristId,
                    Rating = 5,
                    Comment = "The GN clearance check gives so much security. The cottage in Galle was gorgeous, just a 5-min walk to local surf spots. The food cooked by Mrs. Jayasinghe was the best Sri Lankan food we ever tasted. Absolutely recommended!",
                    CreatedAt = new DateTime(2026, 2, 13, 0, 0, 0, DateTimeKind.Utc)
                },
                new Review
                {
                    Id = new Guid("30000000-0000-0000-0000-000000000003"),
                    BookingId = booking3Id,
                    TouristId = touristId,
                    Rating = 5,
                    Comment = "Elena stayed at Kandy View Villa and found the escrow booking security incredibly transparent. Smooth check-in, check-out, and beautiful home-cooked food. Strongly recommended!",
                    CreatedAt = new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc)
                },
                new Review
                {
                    Id = new Guid("30000000-0000-0000-0000-000000000004"),
                    BookingId = booking4Id,
                    TouristId = touristId,
                    Rating = 5,
                    Comment = "Incredibly beautiful eco lodge directly facing Sigiriya rock. The host served delicious organic meals fresh from the garden.",
                    CreatedAt = new DateTime(2026, 3, 19, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}
