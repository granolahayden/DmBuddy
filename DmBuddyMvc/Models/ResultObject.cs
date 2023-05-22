namespace DmBuddyMvc.Models
{
    public static class ResultObjects
    {
        public static IResultObject GoodResult() => new GoodResult();
        public static IResultObject BadResult() => new BadResult();
    }
    public interface IResultObject
    {
        public bool IsSuccess { get; }
    }

    public class GoodResult : IResultObject
    {
        public bool IsSuccess => true;
    }
    public class BadResult : IResultObject
    {
        public bool IsSuccess => false;
    }

}
