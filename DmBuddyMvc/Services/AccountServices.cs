using DmBuddyDatabase;
using Microsoft.EntityFrameworkCore;
using System.Security.Principal;

namespace DmBuddyMvc.Services
{
    public class AccountServices
    {
        private readonly Database _db;
        const string PREMIUMID = "69fc5c79-6411-45f2-95f2-788615757515";
        public AccountServices(Database db)
        {
            _db = db;
        }
        public async Task<string> GetRoleAndTerminationDateFromUserAsync(IPrincipal user)
        {
            var username = user.Identity?.Name ?? "";
            var userid = await GetLoginAsQueryable(user).Select(nu => nu.Id).FirstOrDefaultAsync();
            if (userid == null)
                return "User not found";
            var loginterm = await _db.LoginTerminations.AsNoTracking().Include(lt => lt.Role).FirstOrDefaultAsync(lt => lt.LoginId == userid);

            if (loginterm == null || loginterm.TerminationDate < DateTime.UtcNow)
                return "No current subscription.";
            else
                return $"{loginterm.Role.Name} until {loginterm.TerminationDate.ToShortDateString()}";
        }

        private IQueryable<AspNetUsers> GetLoginAsQueryable(IPrincipal user)
        {
            if (user.Identity?.Name is null)
                return _db.AspNetUsers.Where(nu => nu.UserName == "");
            return _db.AspNetUsers.Where(nu => nu.UserName == user.Identity.Name);
        }

        public async Task<bool> AddPremiumSubscriptionToUserForMonths(IPrincipal user, int monthstoadd)
        {
            try
            {
                var login = await GetLoginAsQueryable(user).Include(nu => nu.AspNetUserRoles).Include(nu => nu.LoginTerminations).FirstOrDefaultAsync();
                if (login == null)
                    throw new Exception();

                var todaysdate = DateTime.UtcNow.Date;

                var logintermination = login.LoginTerminations;
                if (logintermination == null)
                {
                    logintermination = new LoginTerminations { LoginId = login.Id, RoleId = PREMIUMID, TerminationDate = todaysdate };
                    _db.LoginTerminations.Add(logintermination);
                }
                    

                if (logintermination.TerminationDate < todaysdate)
                    logintermination.TerminationDate = todaysdate;

                logintermination.TerminationDate = logintermination.TerminationDate.AddMonths(monthstoadd);

                if (!login.AspNetUserRoles.Where(ur => ur.RoleId == PREMIUMID).Any())
                    _db.AspNetUserRoles.Add(new AspNetUserRoles { RoleId = PREMIUMID, UserId = login.Id });

                await _db.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
