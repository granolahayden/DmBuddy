namespace DmBuddyMvc.Models
{
    public static class IdentityConsts
    {
        //Admin is me
        //Premium is $7/mo for extra space and whatnot
        //Basic is $5/mo for basic space and full functionality
        //No roles would be free

        public static class Roles
        {
            public const string Admin = "Admin";
            public const string Premium = "Premium";
            public const string Basic = "Basic";
        }

        public static class Policies
        {
            public const string RequireAdmin = "RequireAdmin";
            public const string RequirePremium = "RequirePremium";
            public const string RequireBasic = "RequireBasic";
        }
    }

    public static class DirectoryConsts
    {
        public const string CreaturePartials = "/Views/Encounter/CreaturePartials";
    }
}
