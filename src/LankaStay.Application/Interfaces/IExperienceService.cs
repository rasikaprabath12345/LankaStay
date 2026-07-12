using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LankaStay.Application.DTOs;

namespace LankaStay.Application.Interfaces
{
    public interface IExperienceService
    {
        Task<IEnumerable<ExperienceDto>> GetExperiencesAsync(string? location, List<Guid>? tagIds);
        Task<ExperienceDto?> GetExperienceByIdAsync(Guid id);
        Task<ExperienceDto> CreateExperienceAsync(CreateExperienceDto createDto, Guid hostId);
        Task<bool> UpdateExperienceAsync(Guid experienceId, CreateExperienceDto updateDto, Guid hostId);
        Task<bool> AddPeakSeasonAsync(Guid experienceId, CreatePeakSeasonDto peakDto, Guid hostId);
        Task<IEnumerable<TagDto>> GetAllTagsAsync();
    }
}
