using DmBuddyMvc.Models;
using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class EncounterController : Controller
    {
        Guid x = Guid.NewGuid();
        
        public IActionResult Index()
        {
            ViewData["test"] = x;
            return View();
        }

        [HttpPost]
        public IActionResult AddCreature()
        {
            return Json(x);
        }
    }
}
