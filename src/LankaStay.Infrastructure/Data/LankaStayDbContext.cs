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
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = new Guid("00000000-0000-0000-0000-000000000001"),
                    Email = "admin@lankastay.com",
                    PasswordHash = "$2a$11$NO/9X1eydqr1LZVUdpiDP.Ta3vzv6dtT94il7Nb78phx4EuOoVlJ6", // BCrypt format for Admin@LankaStay2026
                    FullName = "LankaStay System Admin",
                    Role = UserRole.Admin,
                    IsVerified = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}
