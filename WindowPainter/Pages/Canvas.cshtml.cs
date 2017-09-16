using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using WindowPainter.Models;
using WindowPainter.Services;

namespace WindowPainter.Pages
{
	public class CanvasModel : PageModel
    {
	    private readonly PainterDbContext db;
	    public Painting Painting { get; private set; }

	    public CanvasModel(PainterDbContext db)
	    {
		    this.db = db;
	    }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
	        if (!id.HasValue)
		        return new StatusCodeResult(405);

			Painting = await db.Paintings.AsNoTracking()
				.Where(p => p.Id == id)
				.SingleOrDefaultAsync();

	        if (Painting == null)
		        return NotFound();

	        return Page();
        }

	    public async Task<IActionResult> OnPostAsync(string title)
	    {
		    var data = new byte[40000];
			Array.Fill(data, (byte)0xff);
		    var painting = new Painting {Title = title, Data = data};
		    db.Paintings.Add(painting);
		    await db.SaveChangesAsync();
		    return Redirect($"~/Canvas/{painting.Id}");
	    }
	}
}