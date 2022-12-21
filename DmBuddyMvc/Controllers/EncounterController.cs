using DmBuddyMvc.Models;
using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class EncounterController : Controller
    {        
        public IActionResult Index(Guid? id)
        {
            if(User.IsInRole(IdentityConsts.Roles.Admin) || User.IsInRole(IdentityConsts.Roles.Premium))
                return View("PremiumEncounter");
            return View("BasicEncounter");
        }

        [HttpPost]
        public IActionResult GetCreatureAsync()
        {
            return Json("");
        }
    }
}
