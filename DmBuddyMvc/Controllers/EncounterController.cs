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
        public IActionResult Index(string encountername)
        {
            return View("Encounter", encountername);
        }

        public IActionResult SavedEncounters()
        {
            return View();
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> NewEncounter(string encountername)
        {
            var username = User?.Identity?.Name;
            if (username is null)
                return BadRequest();

            var result = await _encounterservices.CreateEncounterAsync(username, encountername);
            if (!result.IsSuccess)
                return BadRequest();

            return Redirect($"/Encounter?encountername={encountername}");
        }


        [Authorize]
        [HttpPost]
        public async Task<IResult> SaveEncounter(EncounterDTO encounter)
        {
            var username = User?.Identity?.Name;
            if (username is null || string.IsNullOrWhiteSpace(encounter.Name))
                return Results.BadRequest();

            var result = await _encounterservices.SaveEncounterAsync(encounter, username, encounter.Name);
            return Results.Ok();
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
            return Results.Ok(Json(encounterjson));
        }
    }
}
