import { injectable } from 'tsyringe';
import type { IWhatsAppConfig } from '@/domains/whatsapp/config/whatsapp-config';
import type { IWhatsAppMessageRepository } from '@/domains/whatsapp/repositories/whatsapp-message.repository';
import type { WhatsAppMessage, WhatsAppMessageResponse } from '@/types/whatsapp';
import { WhatsAppHttpClient } from '@/infrastructure/http/whatsapp-http-client';

@injectable()
export class WhatsAppMessageRepository implements IWhatsAppMessageRepository {
  private httpClient: WhatsAppHttpClient;

  constructor(private config: IWhatsAppConfig) {
    this.httpClient = new WhatsAppHttpClient(config);
  }

  /**
   * Send a message via WhatsApp API
   * @param message The message to send
   * @returns The response from WhatsApp API
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppMessageResponse> {
    // Ensure messaging_product is set to "whatsapp"
    const messageToSend = {
      ...message,
      messaging_product: 'whatsapp',
    };

    // Send the message using the HTTP client
    return this.httpClient.post<WhatsAppMessageResponse>(
      `${this.config.phoneNumberId}/messages`,
      messageToSend
    );
  }

  /**
   * Mark a message as read
   * @param messageId The ID of the message to mark as read
   * @returns Success status
   */
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      await this.httpClient.post<{ success: boolean }>(
        `${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }
      );
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  /**
   * Get message status
   * @param messageId The ID of the message to check
   * @returns The current status of the message
   */
  async getMessageStatus(messageId: string): Promise<string> {
    try {
      // Note: The WhatsApp Cloud API doesn't have a direct endpoint for checking message status.
      // Status is typically received through webhooks. This is a placeholder implementation.
      console.log(`Attempting to get status for message: ${messageId}`);
      throw new Error('Message status can only be retrieved through webhooks in the WhatsApp Cloud API.');
    } catch (error) {
      console.error('Error getting message status:', error);
      return 'unknown';
    }
  }
}