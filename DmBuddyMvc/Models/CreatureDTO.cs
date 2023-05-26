namespace DmBuddyMvc.Models
{
	public class CreatureDTO
	{
		public int Id { get; set; }
		public int NameCount { get; set; }
		public string TemplateName { get; set; } = string.Empty;
		public double Initiative { get; set; }
		public int CurrentHP { get; set; }
		public string Notes { get; set; } = string.Empty;
	}

	public class CreatureTemplateDTO
	{
		public string Name { get; set; } = string.Empty;
		public int NameCount { get; set; }
		public int MaxHP { get; set; }
		public int AC { get; set; }
		public string DefaultNotes { get; set; } = string.Empty;
		public string? PictureData { get; set; }
	}
}
