import { IWhatsAppConfig } from '@/domains/whatsapp/config/whatsapp-config';

/**
 * HTTP client for WhatsApp API calls
 */
export class WhatsAppHttpClient {
  constructor(private config: IWhatsAppConfig) {}

  /**
   * Make a POST request to the WhatsApp API
   * @param endpoint The API endpoint (without the base URL)
   * @param body The request body
   * @returns The response from the API
   */
  async post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.config.apiBaseUrl}/${this.config.apiVersion}/${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `WhatsApp API error: ${response.status} ${response.statusText} - ${
          JSON.stringify(errorData)
        }`
      );
    }

    return response.json();
  }

  /**
   * Make a GET request to the WhatsApp API
   * @param endpoint The API endpoint (without the base URL)
   * @param queryParams Optional query parameters
   * @returns The response from the API
   */
  async get<T>(endpoint: string, queryParams: Record<string, string> = {}): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.config.apiBaseUrl}/${this.config.apiVersion}/${endpoint}`;

    // Add query parameters if there are any
    const urlWithParams = new URL(url);
    Object.entries(queryParams).forEach(([key, value]) => {
      urlWithParams.searchParams.append(key, value);
    });

    const response = await fetch(urlWithParams.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `WhatsApp API error: ${response.status} ${response.statusText} - ${
          JSON.stringify(errorData)
        }`
      );
    }

    return response.json();
  }
}