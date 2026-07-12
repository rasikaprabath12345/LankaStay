using System;

namespace LankaStay.Domain.Entities
{
    public class PeakSeason
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal SeasonalMultiplier { get; set; } = 1.0m;

        public Guid ExperienceId { get; set; }
        public virtual Experience Experience { get; set; } = null!;
    }
}
