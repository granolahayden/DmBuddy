using Azure.Storage;
using DmBuddyDatabase;
using DmBuddyMvc.Areas.Identity.Data;
using DmBuddyMvc.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;

var builder = WebApplication.CreateBuilder(args);
var dbconnectionstring = builder.Configuration.GetConnectionString("DmBuddyConnectionString");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(dbconnectionstring));

builder.Services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager<DMBSignInManager>();

// Add services to the container.
builder.Services.AddAzureClients(x =>
{
    x.AddBlobServiceClient(new Uri("https://dmbuddystorage.blob.core.windows.net"), new StorageSharedKeyCredential("dmbuddystorage", builder.Configuration.GetConnectionString("BlobStorageKey")));
   
});
builder.Services.AddDbContext<Database>(options => options.UseSqlServer(dbconnectionstring));
builder.Services.AddScoped<EmailServices>();
builder.Services.AddTransient<EncounterServices>();
builder.Services.AddTransient<AccountServices>();
builder.Services.AddTransient<IBlobServices, BlobServices>();

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
app.UseAuthentication(); ;

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