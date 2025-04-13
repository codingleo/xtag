import { WhatsAppMessage } from '@/types/whatsapp';

/**
 * Represents an incoming WhatsApp message
 */
export interface IncomingWhatsAppMessage {
  messageId: string;
  from: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  image?: {
    id: string;
    caption?: string;
    sha256?: string;
    mime_type?: string;
  };
  audio?: {
    id: string;
    mime_type?: string;
  };
  document?: {
    id: string;
    caption?: string;
    filename?: string;
    mime_type?: string;
  };
  video?: {
    id: string;
    caption?: string;
    mime_type?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  button?: {
    payload: string;
    text: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  context?: {
    from: string;
    id: string;
  };
}

/**
 * Represents the result of handling an incoming message
 */
export interface IncomingMessageHandlerResult {
  success: boolean;
  response?: WhatsAppMessage;
  error?: string;
}

/**
 * Use case interface for handling incoming WhatsApp messages
 */
export interface IHandleIncomingMessageUseCase {
  /**
   * Process an incoming message and determine the appropriate response
   * @param message The incoming message to process
   * @returns The result of handling the message, including any response to send
   */
  handle(message: IncomingWhatsAppMessage): Promise<IncomingMessageHandlerResult>;

  /**
   * Register a handler for a specific message type
   * @param type The type of message to handle
   * @param handler The handler function to process this message type
   */
  registerTypeHandler(
    type: string,
    handler: (message: IncomingWhatsAppMessage) => Promise<IncomingMessageHandlerResult>
  ): void;
}