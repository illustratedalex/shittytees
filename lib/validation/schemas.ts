import { z } from 'zod';

export const CheckoutLineItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
  name: z.string(),
  image: z.string().url(),
  size: z.string(),
  color: z.string(),
  unitPrice: z.number().nonnegative(),
  printfulVariantId: z.string(),
});

export const CheckoutRequestSchema = z.object({
  items: z.array(CheckoutLineItemSchema).min(1),
  shippingAddress: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().min(1).max(200),
    addressLine2: z.string().optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(2).max(2),
    postalCode: z.string().min(1).max(20),
    country: z.literal('US'),
  }),
});

export const ContactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;
export type CheckoutLineItem = z.infer<typeof CheckoutLineItemSchema>;
export type ContactForm = z.infer<typeof ContactFormSchema>;
