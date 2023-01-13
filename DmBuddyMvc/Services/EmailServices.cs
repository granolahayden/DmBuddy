using System.Net;
using System.Net.Mail;

namespace DmBuddyMvc.Services
{
    public class EmailServices
    {
        private const string FROM = "dmbuddy.service@gmail.com";
        private readonly SmtpClient _smtpclient;
        public EmailServices(IConfiguration config)
        {
            _smtpclient = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential(FROM, config["EmailPassword"]),
                EnableSsl = true,
                UseDefaultCredentials = false
            };
        }

        public async Task SendEmailAsync(MailMessage mail)
        {
            await _smtpclient.SendMailAsync(mail);
        }
    }
}
