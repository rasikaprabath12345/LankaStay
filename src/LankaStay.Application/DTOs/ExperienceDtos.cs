using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LankaStay.Application.DTOs
{
    public class TagDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class ExperienceDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal BasePrice { get; set; }
        public string Location { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        
        public Guid HostId { get; set; }
        public string HostName { get; set; } = string.Empty;
        public bool HostIsVerified { get; set; }

        public List<TagDto> Tags { get; set; } = new List<TagDto>();
        public List<PeakSeasonDto> PeakSeasons { get; set; } = new List<PeakSeasonDto>();
        public double AverageRating { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class CreateExperienceDto
    {
        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required, Range(0.01, 100000.00)]
        public decimal BasePrice { get; set; }

        [Required, MaxLength(250)]
        public string Location { get; set; } = string.Empty;

        public List<Guid> TagIds { get; set; } = new List<Guid>();
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class PeakSeasonDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal SeasonalMultiplier { get; set; }
    }

    public class CreatePeakSeasonDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required, Range(1.0, 5.0)]
        public decimal SeasonalMultiplier { get; set; }
    }
}
