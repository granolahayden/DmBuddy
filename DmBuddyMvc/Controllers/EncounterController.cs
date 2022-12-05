using DmBuddyMvc.Models;
using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class EncounterController : Controller
    {        
        public IActionResult Index()
        {
            return View(new List<Creature>());
        }
    }
}
