/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import {logger} from "firebase-functions/v2";
import {MailerSend, EmailParams, Sender, Recipient} from "mailersend";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private mailerSend: MailerSend;
  private sender: string;
  private senderName: string;

  constructor() {
    const apiKey = process.env.MAILERSEND_API_KEY;
    this.sender = process.env.EMAIL_SENDER || "noreply@yourdomain.com";
    this.senderName = process.env.EMAIL_SENDER_NAME || "SchoolDiary";

    if (!apiKey) {
      throw new Error(
        "MailerSend API key non configurata. Imposta la variabile d'ambiente MAILERSEND_API_KEY nel file .env"
      );
    }

    this.mailerSend = new MailerSend({
      apiKey: apiKey,
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const sentFrom = new Sender(this.sender, this.senderName);
      const recipients = [new Recipient(options.to)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(options.subject)
        .setHtml(options.html);

      if (options.text) {
        emailParams.setText(options.text);
      }

      await this.mailerSend.email.send(emailParams);
      logger.info(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      logger.error("Error sending email:", error);
      return false;
    }
  }

  async sendActivationEmail(email: string, activationLink: string): Promise<boolean> {
    const subject = "Attiva il tuo account SchoolDiary";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4CAF50; margin: 0;">SchoolDiary</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Gestione Scolastica</p>
        </div>
        
        <h2 style="color: #333; margin-top: 0;">Benvenuto su SchoolDiary!</h2>
        <p style="color: #444; line-height: 1.5;">
          Grazie per esserti registrato. Per attivare il tuo account e iniziare a utilizzare SchoolDiary, 
          clicca sul pulsante qui sotto:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;
                    display: inline-block;">
            Attiva Account
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin: 25px 0 15px 0;">
          Se il pulsante non funziona, copia e incolla questo link nel tuo browser:
        </p>
        <div style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 13px; color: #333;">
          ${activationLink}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
          <p>Questo link scadrà tra 24 ore.</p>
          <p>Se non hai richiesto la registrazione, puoi ignorare questa email.</p>
          <p style="margin-top: 20px;">
            Grazie,<br>
            <strong>Il team di SchoolDiary</strong>
          </p>
        </div>
      </div>
    `;

    const text = `
Benvenuto su SchoolDiary!

Per attivare il tuo account, visita il seguente link:
${activationLink}

Se non hai richiesto la registrazione, puoi ignorare questa email.

Grazie,
Il team di SchoolDiary`;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
