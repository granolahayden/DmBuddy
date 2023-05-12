using DmBuddyMvc.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class EncounterController : Controller
    {
        public IActionResult Index(Guid? id)
        {
            return View("Encounter");
        }

        public IActionResult SavedEncounters()
        {
            return View();
        }


        public IActionResult CreateEncounter()
        {
            if (!User.IsAtLeastBasic())
            {
                return Redirect("/Identity/Account/Login");
            }
            else return View();
        }

        [HttpPost]
        public IActionResult GetCreatureAsync()
        {
            return Json("");
        }
    }
}
