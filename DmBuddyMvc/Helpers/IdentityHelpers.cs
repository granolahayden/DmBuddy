using DmBuddyMvc.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Principal;

namespace DmBuddyMvc.Helpers
{
    public static class IdentityHelpers
    {

        public static bool IsAdmin(this IPrincipal user) => user.IsInRole(IdentityConsts.Roles.Admin);
        public static bool IsAtLeastPremium(this IPrincipal user) => user.IsInRole(IdentityConsts.Roles.Premium) || user.IsAdmin();
        public static bool IsAtLeastBasic(this IPrincipal user) => user.IsInRole(IdentityConsts.Roles.Basic) || user.IsAtLeastPremium();
    }
}
