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
    public class ExperienceService : IExperienceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ExperienceService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ExperienceDto>> GetExperiencesAsync(string? location, List<Guid>? tagIds)
        {
            var experiences = await _unitOfWork.Experiences.GetExperiencesWithDetailsAsync(location, tagIds);
            return _mapper.Map<IEnumerable<ExperienceDto>>(experiences);
        }

        public async Task<ExperienceDto?> GetExperienceByIdAsync(Guid id)
        {
            var experience = await _unitOfWork.Experiences.GetExperienceWithDetailsAsync(id);
            if (experience == null) return null;
            return _mapper.Map<ExperienceDto>(experience);
        }

        public async Task<ExperienceDto> CreateExperienceAsync(CreateExperienceDto createDto, Guid hostId)
        {
            var host = await _unitOfWork.Users.GetByIdAsync(hostId);
            if (host == null || host.Role != UserRole.Host)
            {
                throw new Exception("Unauthorized: Only host accounts can create experiences.");
            }

            // Strict Host Verification Check
            if (!host.IsVerified)
            {
                throw new Exception("Forbidden: Your host profile must be verified by an administrator before you can list experiences.");
            }

            var experience = _mapper.Map<Experience>(createDto);
            experience.HostId = hostId;
            experience.CreatedAt = DateTime.UtcNow;

            // Map and attach tags
            if (createDto.TagIds != null && createDto.TagIds.Any())
            {
                foreach (var tagId in createDto.TagIds)
                {
                    var tag = await _unitOfWork.Tags.GetByIdAsync(tagId);
                    if (tag != null)
                    {
                        experience.ExperienceTags.Add(new ExperienceTag
                        {
                            Experience = experience,
                            TagId = tagId
                        });
                    }
                }
            }

            await _unitOfWork.Experiences.AddAsync(experience);
            await _unitOfWork.CompleteAsync();

            // Retrieve with relations populated
            var savedExperience = await _unitOfWork.Experiences.GetExperienceWithDetailsAsync(experience.Id);
            return _mapper.Map<ExperienceDto>(savedExperience!);
        }

        public async Task<bool> AddPeakSeasonAsync(Guid experienceId, CreatePeakSeasonDto peakDto, Guid hostId)
        {
            var experience = await _unitOfWork.Experiences.GetExperienceWithDetailsAsync(experienceId);
            if (experience == null)
            {
                throw new Exception("Experience not found.");
            }

            if (experience.HostId != hostId)
            {
                throw new Exception("Unauthorized to modify this experience.");
            }

            var peakSeason = _mapper.Map<PeakSeason>(peakDto);
            peakSeason.ExperienceId = experienceId;

            await _unitOfWork.PeakSeasons.AddAsync(peakSeason);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<IEnumerable<TagDto>> GetAllTagsAsync()
        {
            var tags = await _unitOfWork.Tags.GetAllAsync();
            return _mapper.Map<IEnumerable<TagDto>>(tags);
        }
    }
}
