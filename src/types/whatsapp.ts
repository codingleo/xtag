/**
 * WhatsApp Cloud API Types
 * Based on https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */

/**
 * Main Message Object
 */
export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  recipient_type?: 'individual' | 'group';
  to: string;
  type: 'text' | 'image' | 'audio' | 'document' | 'sticker' | 'video' | 'location' | 'contacts' | 'interactive' | 'template' | 'reaction';
  context?: {
    message_id: string;
  };
  biz_opaque_callback_data?: string;

  // Content types - one of these must be provided based on the 'type' field
  text?: TextMessage;
  image?: MediaMessage;
  audio?: MediaMessage;
  document?: MediaMessage;
  sticker?: MediaMessage;
  video?: MediaMessage;
  location?: LocationMessage;
  contacts?: ContactsMessage;
  interactive?: InteractiveMessage;
  template?: TemplateMessage;
  reaction?: ReactionMessage;
}

/**
 * Text Message
 */
export interface TextMessage {
  body: string;
  preview_url?: boolean;
}

/**
 * Media Message (for images, audio, documents, stickers, videos)
 */
export interface MediaMessage {
  id?: string;
  link?: string;
  caption?: string;
  filename?: string;
  provider?: string;
}

/**
 * Location Message
 */
export interface LocationMessage {
  longitude: number;
  latitude: number;
  name?: string;
  address?: string;
}

/**
 * Contacts Message
 */
export interface ContactsMessage {
  contacts: Contact[];
}

export interface Contact {
  addresses?: Address[];
  birthday?: string; // Format: YYYY-MM-DD
  emails?: Email[];
  name: Name;
  org?: Organization;
  phones?: Phone[];
  urls?: URL[];
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  country_code?: string;
  type?: 'HOME' | 'WORK';
}

export interface Email {
  email: string;
  type?: 'HOME' | 'WORK';
}

export interface Name {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

export interface Organization {
  company?: string;
  department?: string;
  title?: string;
}

export interface Phone {
  phone: string;
  type?: 'HOME' | 'WORK' | 'CELL' | 'MAIN' | 'IPHONE' | 'OTHER';
  wa_id?: string;
}

export interface URL {
  url: string;
  type?: 'HOME' | 'WORK';
}

/**
 * Interactive Message
 */
export interface InteractiveMessage {
  type: 'button' | 'list' | 'product' | 'product_list' | 'flow' | 'catalog_message';
  header?: InteractiveHeader;
  body: InteractiveBody;
  footer?: InteractiveFooter;
  action: InteractiveAction;
}

export interface InteractiveHeader {
  type: 'text' | 'video' | 'image' | 'document';
  text?: string;
  video?: MediaMessage;
  image?: MediaMessage;
  document?: MediaMessage;
}

export interface InteractiveBody {
  text: string;
}

export interface InteractiveFooter {
  text: string;
}

export interface InteractiveAction {
  button?: string;
  buttons?: InteractiveButton[];
  catalog_id?: string;
  product_retailer_id?: string;
  sections?: InteractiveSection[];
  name?: string;
  parameters?: Record<string, string | number | boolean | object>;
}

export interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface InteractiveSection {
  title: string;
  rows?: InteractiveSectionRow[];
  product_items?: { product_retailer_id: string }[];
}

export interface InteractiveSectionRow {
  id: string;
  title: string;
  description?: string;
}

/**
 * Template Message
 */
export interface TemplateMessage {
  name: string;
  language: {
    code: string;
    policy?: 'deterministic';
  };
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button' | 'footer';
  sub_type?: 'quick_reply' | 'url' | 'call_to_action';
  index?: string;
  parameters: TemplateParameter[];
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video' | 'payload';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: {
    link: string;
  };
  document?: {
    link: string;
  };
  video?: {
    link: string;
  };
  payload?: string;
}

/**
 * Reaction Message
 */
export interface ReactionMessage {
  message_id: string;
  emoji?: string;
}

/**
 * Response returned by the WhatsApp API when a message is sent successfully
 */
export interface WhatsAppMessageResponse {
  messaging_product: 'whatsapp';
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
    message_status?: 'accepted' | 'held_for_quality_assessment';
  }[];
}