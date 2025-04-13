import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhatsAppMessageRepository } from '../whatsapp-message.repository';
import { WhatsAppHttpClient } from '@/infrastructure/http/whatsapp-http-client';
import type { IWhatsAppConfig } from '@/domains/whatsapp/config/whatsapp-config';
import type { WhatsAppMessage, WhatsAppMessageResponse } from '@/types/whatsapp';

// Mock the tsyringe dependency injection
vi.mock('tsyringe', () => {
  return {
    injectable: () => () => {},
    inject: () => () => {},
  };
});

// Mock the WhatsAppHttpClient
vi.mock('@/infrastructure/http/whatsapp-http-client', () => {
  return {
    WhatsAppHttpClient: vi.fn().mockImplementation(() => {
      return {
        post: vi.fn(),
        get: vi.fn(),
      };
    }),
  };
});

describe('WhatsAppMessageRepository', () => {
  let repository: WhatsAppMessageRepository;
  let mockConfig: IWhatsAppConfig;
  let mockHttpClient: { post: ReturnType<typeof vi.fn>, get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock config
    mockConfig = {
      businessAccountId: 'test-business-id',
      phoneNumberId: 'test-phone-id',
      apiVersion: 'v15.0',
      accessToken: 'test-access-token',
      webhookVerificationToken: 'test-verification-token',
      apiBaseUrl: 'https://graph.facebook.com',
      defaultLanguageCode: 'en_US',
    } as IWhatsAppConfig;

    // Create repository instance
    repository = new WhatsAppMessageRepository(mockConfig);

    // Get reference to mocked HTTP client
    mockHttpClient = (WhatsAppHttpClient as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
  });

  describe('sendMessage', () => {
    it('should call the HTTP client with the correct parameters', async () => {
      // Setup mock response
      const mockResponse: WhatsAppMessageResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
        messages: [{ id: 'wamid.test123' }],
      };
      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      // Create test message
      const message: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: '+1234567890',
        type: 'text',
        text: { body: 'Hello, world!' },
      };

      // Call the method
      const result = await repository.sendMessage(message);

      // Verify HTTP client was called correctly
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'test-phone-id/messages',
        message
      );

      // Verify the result
      expect(result).toEqual(mockResponse);
    });

    it('should ensure messaging_product is set to whatsapp', async () => {
      // Setup mock response
      mockHttpClient.post.mockResolvedValueOnce({
        messaging_product: 'whatsapp',
        contacts: [],
        messages: [],
      });

      // Create test message without messaging_product
      const message = {
        to: '+1234567890',
        type: 'text',
        text: { body: 'Hello, world!' },
      } as WhatsAppMessage;

      // Call the method
      await repository.sendMessage(message);

      // Verify HTTP client was called with messaging_product set
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'test-phone-id/messages',
        expect.objectContaining({
          messaging_product: 'whatsapp',
        })
      );
    });
  });

  describe('markMessageAsRead', () => {
    it('should call the HTTP client with the correct parameters', async () => {
      // Setup mock response
      mockHttpClient.post.mockResolvedValueOnce({ success: true });

      // Call the method
      const result = await repository.markMessageAsRead('wamid.test123');

      // Verify HTTP client was called correctly
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'test-phone-id/messages',
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: 'wamid.test123',
        }
      );

      // Verify the result
      expect(result).toBe(true);
    });

    it('should return false if the API call fails', async () => {
      // Setup mock response to throw an error
      mockHttpClient.post.mockRejectedValueOnce(new Error('API error'));

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Call the method
      const result = await repository.markMessageAsRead('wamid.test123');

      // Verify console.error was called
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error marking message as read:',
        expect.any(Error)
      );

      // Verify the result
      expect(result).toBe(false);

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });
});