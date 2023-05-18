using DmBuddyMvc.Models;
using Microsoft.AspNetCore.Authorization;
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

        [Authorize]
        public IActionResult NewEncounter(string encountername)
        {
            return View("Encounter", encountername);
        }

        [Authorize]
        [HttpPost]
        public IResult SaveEncounter(Encounter encounter)
        {
            return Results.Ok();
        }
    }
}
