import { IWhatsAppConfig } from '@/domains/whatsapp/config/whatsapp-config';

/**
 * Concrete implementation of WhatsApp API configuration
 */
export class WhatsAppConfig implements IWhatsAppConfig {
  constructor(
    public readonly businessAccountId: string,
    public readonly phoneNumberId: string,
    public readonly apiVersion: string,
    public readonly accessToken: string,
    public readonly webhookVerificationToken: string,
    public readonly apiBaseUrl: string = 'https://graph.facebook.com',
    public readonly defaultLanguageCode: string = 'en_US'
  ) {}

  /**
   * Create a WhatsAppConfig from environment variables
   */
  static fromEnv(): WhatsAppConfig {
    const requiredVars = [
      'WHATSAPP_BUSINESS_ACCOUNT_ID',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_API_VERSION',
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_WEBHOOK_VERIFICATION_TOKEN',
    ];

    // Check for required environment variables
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    return new WhatsAppConfig(
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
      process.env.WHATSAPP_PHONE_NUMBER_ID!,
      process.env.WHATSAPP_API_VERSION!,
      process.env.WHATSAPP_ACCESS_TOKEN!,
      process.env.WHATSAPP_WEBHOOK_VERIFICATION_TOKEN!,
      process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com',
      process.env.WHATSAPP_DEFAULT_LANGUAGE_CODE || 'en_US'
    );
  }

  /**
   * Get the full endpoint URL for sending messages
   */
  getMessagesEndpoint(): string {
    return `${this.apiBaseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }
}