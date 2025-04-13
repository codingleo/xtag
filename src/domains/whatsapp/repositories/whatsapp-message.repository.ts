import { WhatsAppMessage, WhatsAppMessageResponse } from '@/types/whatsapp';

/**
 * Repository interface for handling WhatsApp message operations
 */
export interface IWhatsAppMessageRepository {
  /**
   * Send a message via WhatsApp API
   * @param message The message to send
   * @returns The response from WhatsApp API
   */
  sendMessage(message: WhatsAppMessage): Promise<WhatsAppMessageResponse>;

  /**
   * Mark a message as read
   * @param messageId The ID of the message to mark as read
   * @returns Success status
   */
  markMessageAsRead(messageId: string): Promise<boolean>;

  /**
   * Get message status
   * @param messageId The ID of the message to check
   * @returns The current status of the message
   */
  getMessageStatus(messageId: string): Promise<string>;
}