import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WhatsAppConfig } from '../whatsapp-config';

describe('WhatsAppConfig', () => {
  // Save original process.env
  const originalEnv = { ...process.env };

  // Mock environment variables before each test
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      NODE_ENV: 'test',
      WHATSAPP_BUSINESS_ACCOUNT_ID: 'test-business-id',
      WHATSAPP_PHONE_NUMBER_ID: 'test-phone-id',
      WHATSAPP_API_VERSION: 'v15.0',
      WHATSAPP_ACCESS_TOKEN: 'test-access-token',
      WHATSAPP_WEBHOOK_VERIFICATION_TOKEN: 'test-verification-token',
    };
  });

  // Restore original process.env after each test
  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create a config instance with the provided values', () => {
    const config = new WhatsAppConfig(
      'business-id',
      'phone-id',
      'v14.0',
      'access-token',
      'verification-token',
      'https://custom-api.example.com',
      'pt_BR'
    );

    expect(config.businessAccountId).toBe('business-id');
    expect(config.phoneNumberId).toBe('phone-id');
    expect(config.apiVersion).toBe('v14.0');
    expect(config.accessToken).toBe('access-token');
    expect(config.webhookVerificationToken).toBe('verification-token');
    expect(config.apiBaseUrl).toBe('https://custom-api.example.com');
    expect(config.defaultLanguageCode).toBe('pt_BR');
  });

  it('should create a config instance from environment variables', () => {
    const config = WhatsAppConfig.fromEnv();

    expect(config.businessAccountId).toBe('test-business-id');
    expect(config.phoneNumberId).toBe('test-phone-id');
    expect(config.apiVersion).toBe('v15.0');
    expect(config.accessToken).toBe('test-access-token');
    expect(config.webhookVerificationToken).toBe('test-verification-token');
    expect(config.apiBaseUrl).toBe('https://graph.facebook.com'); // Default value
    expect(config.defaultLanguageCode).toBe('en_US'); // Default value
  });

  it('should use custom values from environment variables if provided', () => {
    process.env.WHATSAPP_API_BASE_URL = 'https://custom-graph.facebook.com';
    process.env.WHATSAPP_DEFAULT_LANGUAGE_CODE = 'es_ES';

    const config = WhatsAppConfig.fromEnv();

    expect(config.apiBaseUrl).toBe('https://custom-graph.facebook.com');
    expect(config.defaultLanguageCode).toBe('es_ES');
  });

  it('should throw an error if required environment variables are missing', () => {
    // Remove a required environment variable
    delete process.env.WHATSAPP_ACCESS_TOKEN;

    expect(() => WhatsAppConfig.fromEnv()).toThrow('Missing required environment variables: WHATSAPP_ACCESS_TOKEN');
  });

  it('should return the correct messages endpoint', () => {
    const config = new WhatsAppConfig(
      'business-id',
      'phone-id',
      'v14.0',
      'access-token',
      'verification-token'
    );

    const endpoint = config.getMessagesEndpoint();
    expect(endpoint).toBe('https://graph.facebook.com/v14.0/phone-id/messages');
  });
});