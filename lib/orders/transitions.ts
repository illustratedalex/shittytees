import { InvalidOrderTransitionError } from './errors';
import { OrderStatus } from './types';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'canceled', 'failed'],
  paid: ['printful_draft_created', 'submitted_to_printful', 'failed', 'refunded'],
  printful_draft_created: ['submitted_to_printful', 'failed'],
  submitted_to_printful: ['in_fulfillment', 'shipped', 'failed'],
  in_fulfillment: ['shipped', 'failed', 'issue_requires_contact'],
  shipped: ['refunded'],
  issue_requires_contact: ['in_fulfillment', 'failed', 'shipped'],
  failed: ['issue_requires_contact'],
  canceled: [],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidOrderTransitionError(`Cannot transition from ${from} to ${to}`);
  }
}

export function allowedTransitions(from: OrderStatus): OrderStatus[] {
  return [...TRANSITIONS[from]];
}
