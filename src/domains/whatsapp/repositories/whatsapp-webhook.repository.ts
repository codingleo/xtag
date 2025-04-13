/**
 * Webhook event types from WhatsApp API
 */
export type WhatsAppWebhookEventType =
  | 'message'
  | 'status'
  | 'message_template_status_update';

/**
 * Repository interface for handling WhatsApp webhook operations
 */
export interface IWhatsAppWebhookRepository {
  /**
   * Verify the webhook with WhatsApp API
   * @param mode The mode of verification
   * @param token The verification token
   * @param challenge The challenge string from WhatsApp
   * @returns The challenge string if verified, null if not
   */
  verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null>;

  /**
   * Process incoming webhook payload
   * @param payload The webhook payload received from WhatsApp
   * @returns Success status
   */
  processWebhookPayload(payload: Record<string, unknown>): Promise<boolean>;

  /**
   * Register a handler for a specific webhook event type
   * @param eventType The type of event to handle
   * @param handler The handler function to call when this event is received
   */
  registerEventHandler(
    eventType: WhatsAppWebhookEventType,
    handler: (data: unknown) => Promise<void>
  ): void;
}