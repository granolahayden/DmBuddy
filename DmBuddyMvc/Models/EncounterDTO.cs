namespace DmBuddyMvc.Models
{
    public class EncounterDTO
    {
        public string Name { get; set; } = string.Empty;
        public int? CurrentId { get; set; }
        public List<CreatureDTO> Creatures { get; set; } = new List<CreatureDTO>();
        public List<CreatureTemplateDTO> CreatureTemplates { get; set; } = new List<CreatureTemplateDTO>();
    }
}
