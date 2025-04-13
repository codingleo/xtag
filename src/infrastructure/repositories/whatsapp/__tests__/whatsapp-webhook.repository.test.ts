import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhatsAppWebhookRepository } from '../whatsapp-webhook.repository';
import type { IWhatsAppConfig } from '@/domains/whatsapp/config/whatsapp-config';
import type { WhatsAppWebhookEventType } from '@/domains/whatsapp/repositories/whatsapp-webhook.repository';

// Mock the tsyringe dependency injection
vi.mock('tsyringe', () => {
  return {
    injectable: () => () => {},
    inject: () => () => {},
  };
});

describe('WhatsAppWebhookRepository', () => {
  let repository: WhatsAppWebhookRepository;
  let mockConfig: IWhatsAppConfig;

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
    repository = new WhatsAppWebhookRepository(mockConfig);
  });

  describe('verifyWebhook', () => {
    it('should return the challenge if mode and token are valid', async () => {
      const result = await repository.verifyWebhook(
        'subscribe',
        'test-verification-token',
        'test-challenge'
      );

      expect(result).toBe('test-challenge');
    });

    it('should return null if mode is not subscribe', async () => {
      const result = await repository.verifyWebhook(
        'invalid-mode',
        'test-verification-token',
        'test-challenge'
      );

      expect(result).toBeNull();
    });

    it('should return null if token does not match', async () => {
      const result = await repository.verifyWebhook(
        'subscribe',
        'invalid-token',
        'test-challenge'
      );

      expect(result).toBeNull();
    });
  });

  describe('processWebhookPayload', () => {
    it('should return false if the payload object is not whatsapp_business_account', async () => {
      const payload = {
        object: 'invalid-object',
        entry: [],
      };

      const result = await repository.processWebhookPayload(payload);

      expect(result).toBe(false);
    });

    it('should process messages in the payload', async () => {
      // Create a mock handler
      const mockHandler = vi.fn().mockResolvedValue(undefined);

      // Register the handler
      repository.registerEventHandler('message', mockHandler);

      // Create a payload with messages
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'test-entry-id',
            changes: [
              {
                field: 'messages',
                value: {
                  messages: [
                    {
                      id: 'test-message-id',
                      from: 'test-phone',
                      type: 'text',
                      text: { body: 'Hello' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const result = await repository.processWebhookPayload(payload);

      expect(result).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(payload.entry[0].changes[0].value);
    });

    it('should process statuses in the payload', async () => {
      // Create a mock handler
      const mockHandler = vi.fn().mockResolvedValue(undefined);

      // Register the handler
      repository.registerEventHandler('status', mockHandler);

      // Create a payload with statuses
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'test-entry-id',
            changes: [
              {
                field: 'messages',
                value: {
                  statuses: [
                    {
                      id: 'test-message-id',
                      status: 'delivered',
                      timestamp: '1234567890',
                      recipient_id: 'test-phone',
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const result = await repository.processWebhookPayload(payload);

      expect(result).toBe(true);
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockHandler).toHaveBeenCalledWith(payload.entry[0].changes[0].value);
    });

    it('should handle errors during processing', async () => {
      // Mock console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a mock handler that throws an error
      const mockHandler = vi.fn().mockRejectedValue(new Error('Handler error'));

      // Register the handler
      repository.registerEventHandler('message' as WhatsAppWebhookEventType, mockHandler);

      // Create a payload that will cause an error
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                field: 'messages',
                value: {
                  messages: [{}],
                },
              },
            ],
          },
        ],
      };

      const result = await repository.processWebhookPayload(payload);

      expect(result).toBe(false);
      expect(mockHandler).toHaveBeenCalledTimes(1);

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });
});