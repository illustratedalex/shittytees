import { NextResponse } from 'next/server';
import {
  DatabaseConfigurationError,
  FulfillmentDisabledError,
  InvalidOrderTransitionError,
  OrderAccessDeniedError,
  OrderNotFoundError,
  PaymentNotConfirmedError,
  PrintfulDraftMissingError,
  UnresolvedVariantError,
} from './errors';

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof OrderNotFoundError) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (error instanceof OrderAccessDeniedError) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  if (error instanceof InvalidOrderTransitionError) {
    return NextResponse.json({ error: 'Invalid transition' }, { status: 409 });
  }

  if (error instanceof FulfillmentDisabledError) {
    return NextResponse.json({ error: 'Fulfillment disabled' }, { status: 409 });
  }

  if (error instanceof PaymentNotConfirmedError || error instanceof PrintfulDraftMissingError || error instanceof UnresolvedVariantError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof DatabaseConfigurationError) {
    return NextResponse.json({ error: 'Order system unavailable' }, { status: 503 });
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
