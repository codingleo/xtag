import { injectable } from 'tsyringe';
import type { IWhatsAppConfig } from '@/domains/whatsapp/config/whatsapp-config';
import type {
  IWhatsAppWebhookRepository,
  WhatsAppWebhookEventType
} from '@/domains/whatsapp/repositories/whatsapp-webhook.repository';

@injectable()
export class WhatsAppWebhookRepository implements IWhatsAppWebhookRepository {
  // Store event handlers for different event types
  private eventHandlers: Map<WhatsAppWebhookEventType, Array<(data: unknown) => Promise<void>>> = new Map();

  constructor(private config: IWhatsAppConfig) {}

  /**
   * Verify the webhook with WhatsApp API
   * @param mode The mode of verification
   * @param token The verification token
   * @param challenge The challenge string from WhatsApp
   * @returns The challenge string if verified, null if not
   */
  async verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
    // Check if the verification token matches and mode is 'subscribe'
    if (mode === 'subscribe' && token === this.config.webhookVerificationToken) {
      console.log('Webhook verified');
      return challenge;
    }

    console.error('Webhook verification failed');
    return null;
  }

  /**
   * Process incoming webhook payload
   * @param payload The webhook payload received from WhatsApp
   * @returns Success status
   */
  async processWebhookPayload(payload: Record<string, unknown>): Promise<boolean> {
    try {
      // Verify the payload is from WhatsApp
      if (payload?.object !== 'whatsapp_business_account') {
        console.error('Invalid webhook payload object:', payload?.object);
        return false;
      }

      // Extract the entry array
      const entries = payload?.entry as Array<Record<string, unknown>> || [];

      for (const entry of entries) {
        // Process each change in the entry
        const changes = entry?.changes as Array<Record<string, unknown>> || [];

        for (const change of changes) {
          // Verify the change is for WhatsApp
          if (change?.field !== 'messages') {
            continue;
          }

          const value = change?.value as Record<string, unknown> || {};

          // Process messages
          if (value?.messages) {
            await this.processMessages(value);
          }

          // Process statuses
          if (value?.statuses) {
            await this.processStatuses(value);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error processing webhook payload:', error);
      return false;
    }
  }

  /**
   * Register a handler for a specific webhook event type
   * @param eventType The type of event to handle
   * @param handler The handler function to call when this event is received
   */
  registerEventHandler(
    eventType: WhatsAppWebhookEventType,
    handler: (data: unknown) => Promise<void>
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }

    this.eventHandlers.get(eventType)?.push(handler);
  }

  /**
   * Process messages from the webhook payload
   * @param value The value containing messages
   */
  private async processMessages(value: Record<string, unknown>): Promise<void> {
    const messages = value?.messages as Array<Record<string, unknown>> || [];

    if (messages.length === 0) {
      return;
    }

    // Get handlers for message events
    const handlers = this.eventHandlers.get('message') || [];

    // Call each handler with the messages data
    const promises = handlers.map(handler => handler(value));
    await Promise.all(promises);
  }

  /**
   * Process statuses from the webhook payload
   * @param value The value containing statuses
   */
  private async processStatuses(value: Record<string, unknown>): Promise<void> {
    const statuses = value?.statuses as Array<Record<string, unknown>> || [];

    if (statuses.length === 0) {
      return;
    }

    // Get handlers for status events
    const handlers = this.eventHandlers.get('status') || [];

    // Call each handler with the statuses data
    const promises = handlers.map(handler => handler(value));
    await Promise.all(promises);
  }
}