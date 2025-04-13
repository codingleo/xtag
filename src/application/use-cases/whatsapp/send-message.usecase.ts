import { injectable, inject } from 'tsyringe';
import type {
  ISendMessageUseCase,
  SendTextMessageParams,
  SendMediaMessageParams,
  SendInteractiveMessageParams,
  SendTemplateMessageParams,
} from '@/domains/whatsapp/use-cases/send-message.usecase';
import type { IWhatsAppMessageRepository } from '@/domains/whatsapp/repositories/whatsapp-message.repository';
import type {
  WhatsAppMessage,
  WhatsAppMessageResponse,
  InteractiveMessage,
  InteractiveAction,
  InteractiveHeader,
  InteractiveBody,
  InteractiveFooter,
  TemplateComponent,
  TemplateParameter
} from '@/types/whatsapp';

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject('WhatsAppMessageRepository')
    private messageRepository: IWhatsAppMessageRepository
  ) {}

  /**
   * Send a text message
   */
  async sendTextMessage(params: SendTextMessageParams): Promise<WhatsAppMessageResponse> {
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'text',
      text: {
        body: params.text,
        preview_url: params.previewUrl,
      },
    };

    // Add reply context if replyToMessageId is provided
    if (params.replyToMessageId) {
      message.context = {
        message_id: params.replyToMessageId,
      };
    }

    return this.messageRepository.sendMessage(message);
  }

  /**
   * Send a media message (image, audio, document, video, sticker)
   */
  async sendMediaMessage(params: SendMediaMessageParams): Promise<WhatsAppMessageResponse> {
    // Validate parameters
    if (!params.mediaId && !params.mediaUrl) {
      throw new Error('Either mediaId or mediaUrl must be provided');
    }

    const mediaContent = {
      ...(params.mediaId ? { id: params.mediaId } : {}),
      ...(params.mediaUrl ? { link: params.mediaUrl } : {}),
      ...(params.caption ? { caption: params.caption } : {}),
      ...(params.filename ? { filename: params.filename } : {}),
    };

    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: params.mediaType,
      [params.mediaType]: mediaContent,
    };

    // Add reply context if replyToMessageId is provided
    if (params.replyToMessageId) {
      message.context = {
        message_id: params.replyToMessageId,
      };
    }

    return this.messageRepository.sendMessage(message);
  }

  /**
   * Send an interactive message (buttons, lists, etc.)
   */
  async sendInteractiveMessage(params: SendInteractiveMessageParams): Promise<WhatsAppMessageResponse> {
    // Create interactive components
    const body: InteractiveBody = {
      text: params.bodyText,
    };

    // Optional components
    let header: InteractiveHeader | undefined;
    let footer: InteractiveFooter | undefined;
    let action: InteractiveAction = {} as InteractiveAction;

    // Add header if provided
    if (params.headerText) {
      header = {
        type: 'text',
        text: params.headerText,
      };
    }

    // Add footer if provided
    if (params.footerText) {
      footer = {
        text: params.footerText,
      };
    }

    // Add action based on interactive type
    if (params.interactiveType === 'button' && params.buttons) {
      action = {
        buttons: params.buttons.map(button => ({
          type: 'reply',
          reply: {
            id: button.id,
            title: button.title,
          },
        })),
      };
    } else if (params.interactiveType === 'list' && params.listSections) {
      action = {
        button: 'Select an option',
        sections: params.listSections,
      };
    }

    // Construct the interactive object
    const interactive: InteractiveMessage = {
      type: params.interactiveType,
      body,
      action,
    };

    if (header) interactive.header = header;
    if (footer) interactive.footer = footer;

    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'interactive',
      interactive,
    };

    // Add reply context if replyToMessageId is provided
    if (params.replyToMessageId) {
      message.context = {
        message_id: params.replyToMessageId,
      };
    }

    return this.messageRepository.sendMessage(message);
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(params: SendTemplateMessageParams): Promise<WhatsAppMessageResponse> {
    // Convert component parameters to the correct type
    const components = params.components?.map(component => {
      const templateComponent: TemplateComponent = {
        type: component.type,
        parameters: component.parameters.map(param => param as unknown as TemplateParameter),
      };
      return templateComponent;
    });

    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'template',
      template: {
        name: params.templateName,
        language: {
          code: params.languageCode,
        },
        components,
      },
    };

    return this.messageRepository.sendMessage(message);
  }

  /**
   * Send a custom message (for advanced use cases)
   */
  async sendCustomMessage(message: WhatsAppMessage): Promise<WhatsAppMessageResponse> {
    return this.messageRepository.sendMessage(message);
  }
}