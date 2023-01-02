using DmBuddyMvc.Models;
using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class EncounterController : Controller
    {        
        public IActionResult Index(Guid? id)
        {
            return View("Encounter");
        }

        [HttpPost]
        public IActionResult GetCreatureAsync()
        {
            return Json("");
        }
    }
}
