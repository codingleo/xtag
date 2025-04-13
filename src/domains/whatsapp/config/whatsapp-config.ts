/**
 * Configuration interface for WhatsApp API
 */
export interface IWhatsAppConfig {
  /**
   * The WhatsApp Business Account ID
   */
  businessAccountId: string;

  /**
   * The WhatsApp phone number ID
   */
  phoneNumberId: string;

  /**
   * The API version to use
   */
  apiVersion: string;

  /**
   * The access token for the API
   */
  accessToken: string;

  /**
   * The verification token for webhooks
   */
  webhookVerificationToken: string;

  /**
   * The base URL for the WhatsApp API
   */
  apiBaseUrl: string;

  /**
   * Default language code for templates
   */
  defaultLanguageCode: string;
}