using System.Net.Mail;

namespace DmBuddyMvc.Models
{
    public class IEmailObject 
    {
        private const string FROM = "dmbuddy.service@gmail.com";
        internal MailMessage _mail { get; private set; }
        
        public IEmailObject(string to)
        {
            _mail = new();
            _mail.From = new MailAddress(FROM);
            _mail.To.Add(to);
            _mail.Subject = "Generic subject";
            _mail.IsBodyHtml = true;
        }

        public MailMessage MailMessage => _mail;
    }

    public class ConfirmationEmail : IEmailObject
    {
        public ConfirmationEmail(string to, string confirmationurl) : base(to)
        {
            _mail.Subject = "DM Buddy Confirmation";
            _mail.Body = @$"<p>Thank you for registering with DM Buddy. Please click the link below to confirm your account.</p>
                <a href=""{confirmationurl}"">Click here to confirm your account.</a>";
        }
    }
}
