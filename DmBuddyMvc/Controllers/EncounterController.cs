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

        [HttpPost]
        public IResult CreateEncounter(string encountername)
        {
            if (!User.IsAtLeastBasic())
            {
                return Results.BadRequest();
            }

            return Results.Content("");
        }
    }
}
