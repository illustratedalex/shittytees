export class OrderNotFoundError extends Error {
  constructor(message = 'Order not found') {
    super(message);
    this.name = 'OrderNotFoundError';
  }
}

export class OrderAccessDeniedError extends Error {
  constructor(message = 'Order access denied') {
    super(message);
    this.name = 'OrderAccessDeniedError';
  }
}

export class InvalidOrderTransitionError extends Error {
  constructor(message = 'Invalid order transition') {
    super(message);
    this.name = 'InvalidOrderTransitionError';
  }
}

export class DuplicateWebhookEventError extends Error {
  constructor(message = 'Duplicate webhook event') {
    super(message);
    this.name = 'DuplicateWebhookEventError';
  }
}

export class FulfillmentDisabledError extends Error {
  constructor(message = 'Fulfillment is disabled') {
    super(message);
    this.name = 'FulfillmentDisabledError';
  }
}

export class UnresolvedVariantError extends Error {
  constructor(message = 'Unresolved variant mapping') {
    super(message);
    this.name = 'UnresolvedVariantError';
  }
}

export class PaymentNotConfirmedError extends Error {
  constructor(message = 'Payment not confirmed') {
    super(message);
    this.name = 'PaymentNotConfirmedError';
  }
}

export class PrintfulDraftMissingError extends Error {
  constructor(message = 'Printful draft missing') {
    super(message);
    this.name = 'PrintfulDraftMissingError';
  }
}

export class DatabaseConfigurationError extends Error {
  constructor(message = 'Database configuration missing') {
    super(message);
    this.name = 'DatabaseConfigurationError';
  }
}
