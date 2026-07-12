using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using LankaStay.Application.DTOs;
using LankaStay.Application.Interfaces;
using LankaStay.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LankaStay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExperiencesController : ControllerBase
    {
        private readonly IExperienceService _experienceService;

        public ExperiencesController(IExperienceService experienceService)
        {
            _experienceService = experienceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetExperiences([FromQuery] string? location, [FromQuery] string? tagIds)
        {
            var parsedTagIds = new List<Guid>();
            if (!string.IsNullOrWhiteSpace(tagIds))
            {
                foreach (var id in tagIds.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    if (Guid.TryParse(id, out var guid))
                    {
                        parsedTagIds.Add(guid);
                    }
                }
            }

            var experiences = await _experienceService.GetExperiencesAsync(location, parsedTagIds);
            return Ok(experiences);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExperienceById(Guid id)
        {
            var experience = await _experienceService.GetExperienceByIdAsync(id);
            if (experience == null)
            {
                return NotFound($"Experience with ID {id} not found.");
            }
            return Ok(experience);
        }

        [Authorize(Roles = "Host")]
        [HttpPost]
        public async Task<IActionResult> CreateExperience([FromBody] CreateExperienceDto createDto)
        {
            var hostIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(hostIdStr) || !Guid.TryParse(hostIdStr, out var hostId))
            {
                return Unauthorized("Invalid host identification.");
            }

            var experience = await _experienceService.CreateExperienceAsync(createDto, hostId);
            return CreatedAtAction(nameof(GetExperienceById), new { id = experience.Id }, experience);
        }

        [Authorize(Roles = "Host")]
        [HttpPost("{id}/peak-season")]
        public async Task<IActionResult> AddPeakSeason(Guid id, [FromBody] CreatePeakSeasonDto peakDto)
        {
            var hostIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(hostIdStr) || !Guid.TryParse(hostIdStr, out var hostId))
            {
                return Unauthorized("Invalid host identification.");
            }

            var result = await _experienceService.AddPeakSeasonAsync(id, peakDto, hostId);
            return Ok(new { success = result, message = "Peak season configuration added successfully." });
        }

        [Authorize(Roles = "Host")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExperience(Guid id, [FromBody] CreateExperienceDto updateDto)
        {
            var hostIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(hostIdStr) || !Guid.TryParse(hostIdStr, out var hostId))
            {
                return Unauthorized("Invalid host identification.");
            }

            var result = await _experienceService.UpdateExperienceAsync(id, updateDto, hostId);
            return Ok(new { success = result, message = "Experience updated successfully." });
        }

        [HttpGet("tags")]
        public async Task<IActionResult> GetAllTags()
        {
            var tags = await _experienceService.GetAllTagsAsync();
            return Ok(tags);
        }
    }
}
