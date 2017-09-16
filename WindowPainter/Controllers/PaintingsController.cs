using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WindowPainter.Models;
using WindowPainter.Services;

namespace WindowPainter.Controllers
{
    [Route("api/[controller]")]
    public class PaintingsController : Controller
    {
	    private readonly PainterDbContext db;

	    public PaintingsController(PainterDbContext db)
	    {
		    this.db = db;
	    }

		[HttpGet("{id:int}")]
	    public async Task GetDataAsync(int id)
		{
			var res = await db.Paintings.Where(p => p.Id == id)
				.Select(p => new {p.Data})
				.SingleAsync();
			Response.ContentLength = res.Data.Length;
			Response.ContentType = "application/octet-stream";
			await Response.Body.WriteAsync(res.Data, 0, res.Data.Length);
		}

		[HttpPut("{id:int}")]
        public async Task<IActionResult> SaveAsync(int id)
		{
			var buf = new byte[40000];
			using (MemoryStream ms = new MemoryStream(buf))
			{
				await Request.Body.CopyToAsync(ms);
			}
			var painting = new Painting {Id = id, Data = buf};
			var entry = db.Paintings.Attach(painting);
			entry.Property(p => p.Data).IsModified = true;
			await db.SaveChangesAsync();
			return Ok();
        }
    }
}
