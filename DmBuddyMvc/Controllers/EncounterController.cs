using DmBuddyMvc.Helpers;
using DmBuddyMvc.Models;
using DmBuddyMvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

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
			if (User.IsAtLeastBasic() && !string.IsNullOrEmpty(encountername))
				return View("Encounter", encountername);
			else
				return View("Encounter");
		}

		public async Task<IActionResult> SavedEncounters()
		{
			List<string> savedencounters = new();
			if (User.IsAtLeastPremium())
				savedencounters = await _encounterservices.GetEncounterListAsync(User.LoginId());

			return View(savedencounters);
		}

		[Authorize]
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> NewEncounter(string encountername)
		{
			if (string.IsNullOrWhiteSpace(encountername))
				return RedirectToActionWithError("SavedEncounters", "Name cannot be blank.");

			var encounters = await _encounterservices.GetEncounterListAsync(User.LoginId());
			if (encounters.Count >= EncounterServices.MAXSAVES)
				return RedirectToActionWithError("SavedEncounters", $"Cannot have more than {EncounterServices.MAXSAVES} encounters.");

			if (!encounters.Contains(encountername))
				await _encounterservices.CreateEncounterAsync(User.LoginId(), encountername);

			return Redirect($"/Encounter?encountername={encountername}");
		}

		private IActionResult RedirectToActionWithError(string action, string error)
		{
			TempData["Error"] = error;
			return RedirectToAction(action);
		}

		[Authorize]
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IResult> DeleteEncounter(string encountername)
		{
			var result = await _encounterservices.DeleteEncounterAsync(User.LoginId(), encountername);
			return result.IsSuccess ? Results.Ok() : Results.BadRequest();
		}


		[Authorize]
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IResult> SaveEncounter(EncounterDTO encounter)
		{
			var result = await _encounterservices.SaveEncounterAsync(User.LoginId(), encounter);
			return result.IsSuccess ? Results.Ok() : Results.BadRequest();
		}

		[Authorize]
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IResult> SaveCreatureData(string encountername, CreatureData creaturedata)
		{
			var result = await _encounterservices.SaveCreatureDataAsync(User.LoginId(), encountername, creaturedata);
			return result.IsSuccess ? Results.Ok() : Results.BadRequest();
		}

		[Authorize]
		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IResult> SaveCreatureTemplateData(string encountername, CreatureTemplateData creaturetemplatedata)
		{
			var result = await _encounterservices.SaveCreatureTemplateDataAsync(User.LoginId(), encountername, creaturetemplatedata);
			return result.IsSuccess ? Results.Ok() : Results.BadRequest();
		}

		[Authorize]
		[HttpGet]
		[Route("[controller]/[action]/{encountername}")]
		public async Task<IResult> LoadEncounter(string encountername)
		{
			var encounterjson = await _encounterservices.LoadEncounterAsync(User.LoginId(), encountername);
			return Results.Ok(JsonSerializer.Serialize(encounterjson));
		}
	}
}
