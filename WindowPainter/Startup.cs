using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WindowPainter.Services;

namespace WindowPainter
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
	        services.AddEntityFrameworkNpgsql();
	        services.AddDbContext<PainterDbContext>(c => c.UseNpgsql(Configuration["ConnectionString"]));

	        services.AddSignalR();
			services.AddMvc();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, PainterDbContext db)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

	        app.UseStaticFiles();
	        app.UseSignalR(routes =>
	        {
		        routes.MapHub<PainterHub>("hub");
	        });

			db.Database.Migrate();

            app.UseMvc();
        }
    }
}
