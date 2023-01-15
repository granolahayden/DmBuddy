using DmBuddyMvc.Areas.Identity.Data;
using DmBuddyMvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Principal;

namespace DmBuddyMvc.Controllers
{
    public class PricingController : Controller
    {
        private readonly AccountServices _accountservices;
        private readonly DMBSignInManager _signinmanager;
        private readonly DMBUserManager _usermanager;
        public PricingController(AccountServices accountservices)
        {
            _accountservices = accountservices;
        }

        public IActionResult Index()
        {
            return View();
        }

        [Authorize]
        [HttpGet]
        public IActionResult Checkout()
        {
            return View();
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Checkout(int id)
        {
            TempData["PurchaseMessage"] = "Thanks for ...";
            var result = await _accountservices.AddPremiumSubscriptionToUserForMonths(User, 1);
            if (result == false)
                RedirectToAction("Checkout");

            var user = await _usermanager.GetApplicationUserFromPrincipalAsync(User);
            await _signinmanager.RefreshSignInAsync(user);
            return RedirectToAction("Thanks");
        }

        public IActionResult Thanks()
        {
            return View();
        }
    }
}
