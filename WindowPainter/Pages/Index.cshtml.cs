using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WindowPainter.Models;
using WindowPainter.Services;

namespace WindowPainter.Pages
{
	public class IndexModel : PageModel
	{
		public List<PaintingMetadata> Paintings { get; private set; }

		private readonly PainterDbContext db;

		public IndexModel(PainterDbContext db)
		{
			this.db = db;
		}

        public async Task OnGetAsync()
        {
	        Paintings = await db.Paintings.AsMetadataDto().ToListAsync();
        }
    }
}