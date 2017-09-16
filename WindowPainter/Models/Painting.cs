using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace WindowPainter.Models
{
    public class Painting
    {
		public int Id { get; set; }
		[Required]
	    public string Title { get; set; }
    }

	public class PaintingMetadata
	{
		public int Id { get; set; }
		public string Title { get; set; }
	}

	public static class PaintingExtensions
	{
		public static IQueryable<PaintingMetadata> AsMetadataDto(this IQueryable<Painting> paintings)
		{
			return paintings.Select(p => new PaintingMetadata
			{
				Id = p.Id,
				Title = p.Title
			});
		}
	}
}
