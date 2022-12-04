using DmBuddyMvc.Models;

namespace DmBuddyMvc.Services
{
    public class EncounterServices
    {
        private IEnumerable<Creature> currentEncounter;
        public EncounterServices() 
        {
            currentEncounter = new List<Creature>();
        }

        public void AddCreature(Creature creature)
        {
            currentEncounter.Append(creature);
        }
    }
}
