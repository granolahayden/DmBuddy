using DmBuddyMvc.Models;
using DmBuddyMvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DmBuddyMvc.Controllers
{
    public class EncounterController : Controller
    {
        private readonly EncounterServices _encounterservices;
        public EncounterController(EncounterServices encounterservices)
        {
            _encounterservices = encounterservices;
        }
        public IActionResult Index(Guid? id)
        {
            return View("Encounter");
        }

        public IActionResult SavedEncounters()
        {
            return View();
        }

        [Authorize]
        [HttpPost]
        public IActionResult NewEncounter(string encountername)
        {
            //create a blank .json in their file
            //redirect to Encounter/?encountername=...
            //load from there like that
            return View("Encounter", encountername);
        }

        [Authorize]
        [HttpPost]
        public async Task<IResult> SaveEncounter(EncounterDTO encounter)
        {
            var username = User?.Identity?.Name;
            if (username is null)
                return Results.BadRequest();

            //var encounterjson = await _blobservice.GetBlobAsJsonAsync(username, "testencounter");
            var encounterjson = await _encounterservices.LoadEncounterAsync(username, "testencounter");
            return Results.Ok(encounterjson);
        }

        [Authorize]
        [HttpGet]
        [Route("[controller]/[action]/{encountername}")]
        public async Task<IResult> LoadEncounter(string encountername)
        {
            var username = User?.Identity?.Name;
            if (username is null)
                return Results.BadRequest();

            //var encounterjson = await _blobservice.GetBlobAsJsonAsync(username, "testencounter");
            var encounterjson = await _encounterservices.LoadEncounterAsync(username, encountername);
            return Results.Ok(encounterjson);
        }
    }
}
