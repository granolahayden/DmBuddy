using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class DemosController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
