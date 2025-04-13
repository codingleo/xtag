import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WhatsAppHttpClient } from '../whatsapp-http-client';
import type { IWhatsAppConfig } from '@/domains/whatsapp/config/whatsapp-config';

// Mock the global fetch function
vi.stubGlobal('fetch', vi.fn());

describe('WhatsAppHttpClient', () => {
  let httpClient: WhatsAppHttpClient;
  // Create a mock config that implements the interface
  const mockConfig = {
    businessAccountId: 'test-business-id',
    phoneNumberId: 'test-phone-id',
    apiVersion: 'v15.0',
    accessToken: 'test-access-token',
    webhookVerificationToken: 'test-verification-token',
    apiBaseUrl: 'https://graph.facebook.com',
    defaultLanguageCode: 'en_US',
  } as IWhatsAppConfig;

  beforeEach(() => {
    vi.resetAllMocks();
    httpClient = new WhatsAppHttpClient(mockConfig);
  });

  describe('post', () => {
    it('should make a POST request to the correct endpoint with proper headers', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, id: '123' }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

      // Call the method
      const endpoint = 'test-phone-id/messages';
      const body = { text: 'Hello, world!' };
      const result = await httpClient.post(endpoint, body);

      // Verify fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v15.0/test-phone-id/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-access-token',
          },
          body: JSON.stringify(body),
        }
      );

      // Verify the result
      expect(result).toEqual({ success: true, id: '123' });
    });

    it('should throw an error when the API response is not ok', async () => {
      // Mock error response
      const errorResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: { message: 'Invalid parameter' } }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(errorResponse as unknown as Response);

      // Call the method and expect it to throw
      const endpoint = 'test-phone-id/messages';
      const body = { invalid: 'data' };

      await expect(httpClient.post(endpoint, body)).rejects.toThrow(
        /WhatsApp API error: 400 Bad Request/
      );
    });

    it('should handle absolute URLs correctly', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

      // Call the method with an absolute URL
      const endpoint = 'https://custom-domain.com/api/whatsapp';
      const body = { text: 'Hello, world!' };
      await httpClient.post(endpoint, body);

      // Verify fetch was called with the absolute URL
      expect(fetch).toHaveBeenCalledWith(
        'https://custom-domain.com/api/whatsapp',
        expect.any(Object)
      );
    });
  });

  describe('get', () => {
    it('should make a GET request with proper authorization header', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [{ id: '123' }] }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

      // Call the method
      const endpoint = 'test-phone-id/messages';
      const result = await httpClient.get(endpoint);

      // Verify fetch was called correctly
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v15.0/test-phone-id/messages',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-access-token',
          },
        }
      );

      // Verify the result
      expect(result).toEqual({ data: [{ id: '123' }] });
    });

    it('should include query parameters in the URL when provided', async () => {
      // Mock successful response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

      // Call the method with query parameters
      const endpoint = 'test-phone-id/messages';
      const queryParams = {
        limit: '10',
        after: 'cursor123',
      };
      await httpClient.get(endpoint, queryParams);

      // Create URL object for comparison
      const expectedUrl = new URL('https://graph.facebook.com/v15.0/test-phone-id/messages');
      expectedUrl.searchParams.append('limit', '10');
      expectedUrl.searchParams.append('after', 'cursor123');

      // Verify fetch was called with URL including query parameters
      expect(fetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.any(Object)
      );
    });

    it('should throw an error when the API response is not ok', async () => {
      // Mock error response
      const errorResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: { message: 'Invalid credentials' } }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(errorResponse as unknown as Response);

      // Call the method and expect it to throw
      const endpoint = 'test-phone-id/messages';

      await expect(httpClient.get(endpoint)).rejects.toThrow(
        /WhatsApp API error: 401 Unauthorized/
      );
    });
  });
});