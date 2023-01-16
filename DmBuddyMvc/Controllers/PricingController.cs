using DmBuddyMvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class PricingController : Controller
    {
        private readonly AccountServices _accountservices;

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
        public async Task<IActionResult> Checkout(int months)
        {
            TempData["PurchaseMessage"] = "Thanks for your purchase! Your account has been upgraded to Premium. You can view your subscription details by clicking on your username.";
            var result = await _accountservices.AddPremiumSubscriptionToUserForMonths(User, months);
            if (result == false)
                return StatusCode(StatusCodes.Status500InternalServerError);

            return Ok();
        }

        public IActionResult Thanks()
        {
            return View();
        }

        public IActionResult Help()
        {
            return View();
        }
    }
}
