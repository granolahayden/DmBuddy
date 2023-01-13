using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class PricingController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Checkout()
        {
            if (User.Identity?.IsAuthenticated == true)
                return View();
            else
                return Redirect("/Identity/Account/Login");
        }
    }
}
