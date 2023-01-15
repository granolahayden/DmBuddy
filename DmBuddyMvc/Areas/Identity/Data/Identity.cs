using DmBuddyDatabase;
using DmBuddyMvc.Helpers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Principal;

namespace DmBuddyMvc.Areas.Identity.Data
{
    //public class DMBUserStore : IUserStore<ApplicationUser>
    //{
    //    private readonly Database _db;
    //    public DMBUserStore(Database db) 
    //    {
    //        _db = db;
    //    }

    //    public Task<string> GetUserIdAsync(ApplicationUser user, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task<string> GetUserNameAsync(ApplicationUser user, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task SetUserNameAsync(ApplicationUser user, string userName, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task<string> GetNormalizedUserNameAsync(ApplicationUser user, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task SetNormalizedUserNameAsync (ApplicationUser user, string normalizedName, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task<IdentityResult> CreateAsync(ApplicationUser user, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task<IdentityResult> UpdateAsync(ApplicationUser user, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task<IdentityResult> DeleteAsync(ApplicationUser user, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task<ApplicationUser> FindByIdAsync(string userId, CancellationToken cancellationToken) => throw new NotImplementedException();
    //    public Task<ApplicationUser> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken) => throw new NotImplementedException();

    //    #region IDisposable Support
    //    private bool disposedValue = false;
    //    protected virtual void Dispose(bool disposing)
    //    {
    //        if (!disposedValue)
    //        {

    //        }
    //        disposedValue = true;
    //    }

    //    public void Dispose()
    //    {
    //        Dispose(true);
    //        GC.SuppressFinalize(this);
    //    }
    //    #endregion
    //}

    public class DMBSignInManager : SignInManager<ApplicationUser>
    {
        private readonly Database _db;
        public DMBSignInManager(UserManager<ApplicationUser> userManager, IHttpContextAccessor contextAccessor, IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory, IOptions<IdentityOptions> optionsAccessor,
            ILogger<SignInManager<ApplicationUser>> logger, IAuthenticationSchemeProvider schemes, IUserConfirmation<ApplicationUser> confirmation, Database db)
        : base(userManager, contextAccessor, claimsFactory, optionsAccessor, logger, schemes, confirmation)
        {
            _db = db;
        }

        public override async Task<SignInResult> PasswordSignInAsync(ApplicationUser user, string password, bool isPersistent, bool lockoutOnFailure)
        {
            try
            {
                var logintermdate = await _db.LoginTerminations.Where(lt => lt.LoginId == user.Id).Select(lt => lt.TerminationDate).FirstOrDefaultAsync();
                if (logintermdate == null || DateTime.UtcNow.Date < logintermdate.Value.Date) { }
                else
                {
                    //expired term
                    var expiredrole = await _db.AspNetUserRoles.FirstOrDefaultAsync(ur => ur.UserId == user.Id);
                    if (expiredrole is AspNetUserRoles)
                        _db.AspNetUserRoles.Remove(expiredrole);

                    await _db.SaveChangesAsync();
                }

                return await base.PasswordSignInAsync(user, password, isPersistent, lockoutOnFailure);
            }
            catch
            {
                return SignInResult.Failed;
            }
        }
    }

    public class DMBUserManager : UserManager<ApplicationUser>{
        private Database _db;
        public DMBUserManager(IUserStore<ApplicationUser> store, IOptions<IdentityOptions> optionsAccessor,
            IPasswordHasher<ApplicationUser> passwordHasher,
            IEnumerable<IUserValidator<ApplicationUser>> userValidators,
            IEnumerable<IPasswordValidator<ApplicationUser>> passwordValidators,
            ILookupNormalizer keyNormalizer,
            IdentityErrorDescriber errors,
            IServiceProvider services,
            ILogger<UserManager<ApplicationUser>> logger,
            Database db)
        : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger)
        {
            _db = db;
        }

        public async Task<ApplicationUser> GetApplicationUserFromPrincipalAsync(IPrincipal user)
        {
            var dbuser = await _db.AspNetUsers.FirstOrDefaultAsync(nu => nu.UserName == user.GetName());
            return dbuser == null ? null
                : new ApplicationUser
                {
                    Id = dbuser.Id,
                    UserName = dbuser.UserName,
                    PasswordHash = dbuser.PasswordHash,
                    Email = dbuser.Email,
                    PhoneNumber = dbuser.PhoneNumber
                };
        }
    }

}
