using Microsoft.EntityFrameworkCore;
using WindowPainter.Models;

namespace WindowPainter.Services
{
    public class PainterDbContext : DbContext
    {
	    public DbSet<Painting> Paintings { get; set; }

	    public PainterDbContext(DbContextOptions<PainterDbContext> options) : base(options) { }
	}
}
