import { container } from 'tsyringe';
import { WhatsAppConfig } from '@/infrastructure/config/whatsapp-config';
import { WhatsAppMessageRepository } from '@/infrastructure/repositories/whatsapp/whatsapp-message.repository';
import { WhatsAppWebhookRepository } from '@/infrastructure/repositories/whatsapp/whatsapp-webhook.repository';
import { SendMessageUseCase } from '@/application/use-cases/whatsapp/send-message.usecase';
import type { IWhatsAppConfig } from '@/domains/whatsapp/config/whatsapp-config';
import type { IWhatsAppMessageRepository } from '@/domains/whatsapp/repositories/whatsapp-message.repository';
import type { IWhatsAppWebhookRepository } from '@/domains/whatsapp/repositories/whatsapp-webhook.repository';
import type { ISendMessageUseCase } from '@/domains/whatsapp/use-cases/send-message.usecase';

/**
 * Register WhatsApp services in the dependency injection container
 */
export function registerWhatsAppServices(): void {
  // Register configuration
  container.register<IWhatsAppConfig>('WhatsAppConfig', {
    useValue: WhatsAppConfig.fromEnv(),
  });

  // Register repositories
  container.registerSingleton<IWhatsAppMessageRepository>(
    'WhatsAppMessageRepository',
    WhatsAppMessageRepository
  );

  container.registerSingleton<IWhatsAppWebhookRepository>(
    'WhatsAppWebhookRepository',
    WhatsAppWebhookRepository
  );

  // Register use cases
  container.registerSingleton<ISendMessageUseCase>(
    'SendMessageUseCase',
    SendMessageUseCase
  );
}

/**
 * Get an instance of the WhatsApp configuration
 */
export function getWhatsAppConfig(): IWhatsAppConfig {
  return container.resolve<IWhatsAppConfig>('WhatsAppConfig');
}

/**
 * Get an instance of the WhatsApp message repository
 */
export function getWhatsAppMessageRepository(): IWhatsAppMessageRepository {
  return container.resolve<IWhatsAppMessageRepository>('WhatsAppMessageRepository');
}

/**
 * Get an instance of the WhatsApp webhook repository
 */
export function getWhatsAppWebhookRepository(): IWhatsAppWebhookRepository {
  return container.resolve<IWhatsAppWebhookRepository>('WhatsAppWebhookRepository');
}

/**
 * Get an instance of the SendMessage use case
 */
export function getSendMessageUseCase(): ISendMessageUseCase {
  return container.resolve<ISendMessageUseCase>('SendMessageUseCase');
}