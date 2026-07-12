using AutoMapper;
using LankaStay.Application.DTOs;
using LankaStay.Domain.Entities;
using System.Linq;

namespace LankaStay.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Tag mappings
            CreateMap<Tag, TagDto>();

            // PeakSeason mappings
            CreateMap<PeakSeason, PeakSeasonDto>();
            CreateMap<CreatePeakSeasonDto, PeakSeason>();

            // Experience mappings
            CreateMap<Experience, ExperienceDto>()
                .ForMember(dest => dest.HostName, opt => opt.MapFrom(src => src.Host.FullName))
                .ForMember(dest => dest.HostIsVerified, opt => opt.MapFrom(src => src.Host.IsVerified))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => src.ExperienceTags.Select(et => et.Tag)))
                .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => 
                    src.Bookings.Any(b => b.Review != null) 
                        ? src.Bookings.Where(b => b.Review != null).Average(b => b.Review!.Rating) 
                        : 0.0));

            CreateMap<CreateExperienceDto, Experience>()
                .ForMember(dest => dest.ExperienceTags, opt => opt.Ignore())
                .ForMember(dest => dest.PeakSeasons, opt => opt.Ignore());

            // Booking mappings
            CreateMap<Booking, BookingDto>()
                .ForMember(dest => dest.ExperienceTitle, opt => opt.MapFrom(src => src.Experience.Title))
                .ForMember(dest => dest.ExperienceLocation, opt => opt.MapFrom(src => src.Experience.Location))
                .ForMember(dest => dest.TouristName, opt => opt.MapFrom(src => src.Tourist.FullName))
                .ForMember(dest => dest.TouristEmail, opt => opt.MapFrom(src => src.Tourist.Email));

            // Payment mappings
            CreateMap<Payment, PaymentDto>();

            // Review mappings
            CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.TouristName, opt => opt.MapFrom(src => src.Tourist.FullName));
        }
    }
}
