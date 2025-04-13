import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SendMessageUseCase } from '../send-message.usecase';
import type { IWhatsAppMessageRepository } from '@/domains/whatsapp/repositories/whatsapp-message.repository';
import type { WhatsAppMessageResponse } from '@/types/whatsapp';

// Mock the tsyringe dependency injection
vi.mock('tsyringe', () => {
  return {
    injectable: () => () => {},
    inject: () => () => {},
  };
});

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;
  let mockMessageRepository: IWhatsAppMessageRepository;

  // Mock response for successful API calls
  const successResponse: WhatsAppMessageResponse = {
    messaging_product: 'whatsapp',
    contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.test123' }],
  };

  beforeEach(() => {
    // Create mock repository
    mockMessageRepository = {
      sendMessage: vi.fn().mockResolvedValue(successResponse),
      markMessageAsRead: vi.fn().mockResolvedValue(true),
      getMessageStatus: vi.fn().mockResolvedValue('sent'),
    };

    // Create use case instance with mocked repository
    useCase = new SendMessageUseCase(mockMessageRepository);
  });

  describe('sendTextMessage', () => {
    it('should format and send a text message correctly', async () => {
      // Call the method
      const result = await useCase.sendTextMessage({
        to: '+1234567890',
        text: 'Hello, world!',
        previewUrl: true,
      });

      // Verify repository was called with correct message format
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: '+1234567890',
          type: 'text',
          text: {
            body: 'Hello, world!',
            preview_url: true,
          },
        })
      );

      // Verify the result
      expect(result).toEqual(successResponse);
    });

    it('should include context for reply messages', async () => {
      // Call the method with replyToMessageId
      await useCase.sendTextMessage({
        to: '+1234567890',
        text: 'This is a reply',
        replyToMessageId: 'wamid.previous123',
      });

      // Verify repository was called with context
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            message_id: 'wamid.previous123',
          },
        })
      );
    });
  });

  describe('sendMediaMessage', () => {
    it('should throw an error if neither mediaId nor mediaUrl is provided', async () => {
      // Attempt to call without required parameters
      await expect(
        useCase.sendMediaMessage({
          to: '+1234567890',
          mediaType: 'image',
        })
      ).rejects.toThrow('Either mediaId or mediaUrl must be provided');

      // Verify repository was not called
      expect(mockMessageRepository.sendMessage).not.toHaveBeenCalled();
    });

    it('should format and send a media message with mediaId correctly', async () => {
      // Call the method with mediaId
      await useCase.sendMediaMessage({
        to: '+1234567890',
        mediaType: 'image',
        mediaId: 'image-id-123',
        caption: 'Nice picture',
      });

      // Verify repository was called with correct message format
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+1234567890',
          type: 'image',
          image: {
            id: 'image-id-123',
            caption: 'Nice picture',
          },
        })
      );
    });

    it('should format and send a media message with mediaUrl correctly', async () => {
      // Call the method with mediaUrl
      await useCase.sendMediaMessage({
        to: '+1234567890',
        mediaType: 'document',
        mediaUrl: 'https://example.com/document.pdf',
        filename: 'document.pdf',
      });

      // Verify repository was called with correct message format
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+1234567890',
          type: 'document',
          document: {
            link: 'https://example.com/document.pdf',
            filename: 'document.pdf',
          },
        })
      );
    });
  });

  describe('sendInteractiveMessage', () => {
    it('should format and send a button interactive message correctly', async () => {
      // Call the method for a button message
      await useCase.sendInteractiveMessage({
        to: '+1234567890',
        interactiveType: 'button',
        headerText: 'Header Text',
        bodyText: 'Body Text',
        footerText: 'Footer Text',
        buttons: [
          { id: 'btn1', title: 'Yes' },
          { id: 'btn2', title: 'No' },
        ],
      });

      // Verify repository was called with correct interactive format
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'interactive',
          interactive: {
            type: 'button',
            header: {
              type: 'text',
              text: 'Header Text',
            },
            body: {
              text: 'Body Text',
            },
            footer: {
              text: 'Footer Text',
            },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: 'btn1',
                    title: 'Yes',
                  },
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'btn2',
                    title: 'No',
                  },
                },
              ],
            },
          },
        })
      );
    });

    it('should format and send a list interactive message correctly', async () => {
      // Call the method for a list message
      await useCase.sendInteractiveMessage({
        to: '+1234567890',
        interactiveType: 'list',
        bodyText: 'Please select an option',
        listSections: [
          {
            title: 'Section 1',
            rows: [
              { id: 'item1', title: 'Item 1', description: 'Description 1' },
              { id: 'item2', title: 'Item 2', description: 'Description 2' },
            ],
          },
        ],
      });

      // Verify repository was called with correct list format
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          interactive: expect.objectContaining({
            type: 'list',
            action: expect.objectContaining({
              button: 'Select an option',
              sections: [
                {
                  title: 'Section 1',
                  rows: [
                    { id: 'item1', title: 'Item 1', description: 'Description 1' },
                    { id: 'item2', title: 'Item 2', description: 'Description 2' },
                  ],
                },
              ],
            }),
          }),
        })
      );
    });
  });

  describe('sendTemplateMessage', () => {
    it('should format and send a template message correctly', async () => {
      // Call the method
      await useCase.sendTemplateMessage({
        to: '+1234567890',
        templateName: 'sample_template',
        languageCode: 'en_US',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'John Doe' },
              { type: 'text', text: '12345' },
            ],
          },
        ],
      });

      // Verify repository was called with correct template format
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'template',
          template: {
            name: 'sample_template',
            language: {
              code: 'en_US',
            },
            components: [
              {
                type: 'body',
                parameters: expect.any(Array),
              },
            ],
          },
        })
      );
    });
  });

  describe('sendCustomMessage', () => {
    it('should pass the custom message directly to the repository', async () => {
      // Create custom message
      const customMessage = {
        messaging_product: 'whatsapp' as const,
        to: '+1234567890',
        type: 'text' as const,
        text: {
          body: 'Custom message',
        },
      };

      // Call the method
      await useCase.sendCustomMessage(customMessage);

      // Verify repository was called with the exact same message
      expect(mockMessageRepository.sendMessage).toHaveBeenCalledWith(customMessage);
    });
  });
});