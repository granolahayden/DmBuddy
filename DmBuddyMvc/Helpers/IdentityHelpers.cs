using DmBuddyMvc.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Security.Principal;

namespace DmBuddyMvc.Helpers
{
    public static class IdentityHelpers
    {

        public static bool IsAdmin(this IPrincipal user) => user.IsInRole(IdentityConsts.Roles.Admin);
        public static bool IsAtLeastPremium(this IPrincipal user) => user.IsInRole(IdentityConsts.Roles.Premium) || user.IsAdmin();
        public static bool IsAtLeastBasic(this IPrincipal user) => user.IsInRole(IdentityConsts.Roles.Basic) || user.IsAtLeastPremium();

        public static string GetName(this IPrincipal user) => user.Identity?.Name ?? string.Empty;
        public static Guid LoginId(this IPrincipal? user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));
            var principal = user as ClaimsPrincipal;
            var id = principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return id == null ? Guid.Empty : Guid.Parse(id);
        }
    }
}
