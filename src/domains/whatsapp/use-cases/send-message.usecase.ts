import { WhatsAppMessage, WhatsAppMessageResponse } from '@/types/whatsapp';

/**
 * Parameters for sending a text message
 */
export interface SendTextMessageParams {
  to: string;
  text: string;
  previewUrl?: boolean;
  replyToMessageId?: string;
}

/**
 * Parameters for sending a media message
 */
export interface SendMediaMessageParams {
  to: string;
  mediaType: 'image' | 'audio' | 'document' | 'video' | 'sticker';
  mediaId?: string;
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  replyToMessageId?: string;
}

/**
 * Parameters for sending an interactive message
 */
export interface SendInteractiveMessageParams {
  to: string;
  interactiveType: 'button' | 'list' | 'product' | 'product_list';
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons?: Array<{
    id: string;
    title: string;
  }>;
  listSections?: Array<{
    title: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
  replyToMessageId?: string;
}

/**
 * Parameters for sending a template message
 */
export interface SendTemplateMessageParams {
  to: string;
  templateName: string;
  languageCode: string;
  components?: Array<{
    type: 'header' | 'body' | 'button';
    parameters: Array<Record<string, unknown>>;
  }>;
}

/**
 * Use case interface for sending WhatsApp messages
 */
export interface ISendMessageUseCase {
  /**
   * Send a text message
   */
  sendTextMessage(params: SendTextMessageParams): Promise<WhatsAppMessageResponse>;

  /**
   * Send a media message (image, audio, document, video, sticker)
   */
  sendMediaMessage(params: SendMediaMessageParams): Promise<WhatsAppMessageResponse>;

  /**
   * Send an interactive message (buttons, lists, etc.)
   */
  sendInteractiveMessage(params: SendInteractiveMessageParams): Promise<WhatsAppMessageResponse>;

  /**
   * Send a template message
   */
  sendTemplateMessage(params: SendTemplateMessageParams): Promise<WhatsAppMessageResponse>;

  /**
   * Send a custom message (for advanced use cases)
   */
  sendCustomMessage(message: WhatsAppMessage): Promise<WhatsAppMessageResponse>;
}