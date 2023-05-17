namespace DmBuddyMvc.Models
{
    public class Creature
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CreatureIndex { get; set; }
        public double Initiative { get; set; }
        public int CurrentHP { get; set; }
        public string Notes { get; set; }

    }

    public class CreatureTemplate
    {
        public string Name { get; set; }
        public int NameCount { get; set; }
        public int HP { get; set; }
        public int AC { get; set; }
        public string DefaultNotes { get; set; }
        public string? ImageData { get; set; }
    }
}
