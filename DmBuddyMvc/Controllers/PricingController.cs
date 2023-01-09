using DmBuddyMvc.Helpers;
using Microsoft.AspNetCore.Authorization;
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
            if (User.Identity?.Name is null)
                return Redirect("/Identity/Account/Login");
            else if(User.IsAtLeastPremium())
                return Redirect("/Pricing");
            else
                return View();
        }
    }
}
