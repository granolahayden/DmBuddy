using DmBuddyDatabase;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DmBuddyMvc.Areas.Identity.Data
{
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
                var termdate = await _db.LoginTerminations.AsNoTracking().Where(lt => lt.LoginId == user.Id).FirstOrDefaultAsync();
                if (termdate == null || DateTime.UtcNow.Date < termdate.TerminationDate.Date) { }
                else
                {
                    //expired term
                    var expiredrole = await _db.AspNetUserRoles.FirstOrDefaultAsync(ur => ur.UserId == user.Id);
                    if (expiredrole is AspNetUserRoles)
                        _db.AspNetUserRoles.Remove(expiredrole);

                    _db.LoginTerminations.Remove(termdate);

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
}
