using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using DmBuddyMvc.Areas.Identity.Data;
using DmBuddyMvc.Services;
using DmBuddyDatabase;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DmBuddyConnectionString");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager<DMBSignInManager>();

// Add services to the container.
builder.Services.AddDbContext<Database>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<EmailServices>();
builder.Services.AddTransient<EncounterServices>();
builder.Services.AddTransient<AccountServices>();

builder.Services.AddControllersWithViews();

#region Authorization
AddAuthorizationPolicies(builder.Services);
#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthentication();;

app.UseAuthorization();

app.MapRazorPages();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();


void AddAuthorizationPolicies(IServiceCollection services)
{
    services.AddAuthorization(options =>
    {
        options.AddPolicy("EmployeeOnly", policy => policy.RequireClaim("EmployeeNumber"));
    });
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
        options.AddPolicy("RequirePremium", policy => policy.RequireRole("Premium"));
    });
}