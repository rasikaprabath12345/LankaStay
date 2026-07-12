using System;

namespace LankaStay.Domain.Entities
{
    public class ExperienceTag
    {
        public Guid ExperienceId { get; set; }
        public virtual Experience Experience { get; set; } = null!;

        public Guid TagId { get; set; }
        public virtual Tag Tag { get; set; } = null!;
    }
}
