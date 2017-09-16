using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace WindowPainter.Services
{
	public class PainterHub : Hub
	{
		public Task SendMessage(string message)
		{
			return Clients.All.InvokeAsync("SendMessage", message);
		}
	}
}