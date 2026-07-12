using System;
using System.Collections.Generic;

namespace LankaStay.Domain.Entities
{
    public class Tag
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public virtual ICollection<ExperienceTag> ExperienceTags { get; set; } = new List<ExperienceTag>();
    }
}
