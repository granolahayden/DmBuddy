using DmBuddyDatabase;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DmBuddyMvc.Services
{
    public class AccountServices
    {
        private readonly Database _db;
        public AccountServices(Database db)
        {
            _db= db;
        }
        public async Task<string> GetUserRoleAndTerminationDateAsync(string loginid)
        {
            var loginterm = await _db.LoginTerminations.Include(lt => lt.Role).FirstOrDefaultAsync(lt => lt.LoginId == loginid);
            if (loginterm == null || loginterm.TerminationDate < DateTime.UtcNow)
                return "No current subscription.";
            else
                return $"{loginterm.Role.Name}{(loginterm.TerminationDate == null ? "" : $" until {((DateTime)loginterm.TerminationDate).ToString("d")}")}";
        }
    }
}
