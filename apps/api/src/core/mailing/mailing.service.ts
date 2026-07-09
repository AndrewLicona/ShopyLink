import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailingService {
  private resend: Resend | null = null;
  private readonly logger = new Logger(MailingService.name);
  private readonly adminEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.adminEmail =
      this.configService.get<string>('SUPER_ADMIN_EMAILS')?.split(',')[0] ||
      'andrewlicona1@gmail.com';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY not found. Emails will be logged to console instead of sent.',
      );
    }
  }

  async sendAdminNotification(subject: string, content: string) {
    const html = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px;">
                <h2 style="color: #4f46e5; margin-top: 0;">Notificación de Administrador</h2>
                <div style="color: #1e293b; font-size: 16px; line-height: 1.5;">
                    ${content}
                </div>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
                <p style="color: #64748b; font-size: 12px;">Este es un mensaje automático del sistema de administración de ShopyLink.</p>
            </div>
        `;

    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'ShopyLink Admin <onboarding@resend.dev>',
          to: this.adminEmail,
          subject: `[ShopyLink Admin] ${subject}`,
          html: html,
        });
        this.logger.log(`Admin notification sent: ${subject}`);
      } catch (error) {
        this.logger.error(`Failed to send email: ${error.message}`);
      }
    } else {
      this.logger.log(`[MOCK EMAIL to ${this.adminEmail}]`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Body: ${content}`);
    }
  }
}
