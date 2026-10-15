import { z } from 'zod';
const list = z.array(z.string().trim().min(1).max(80)).max(40);
export const ProviderInput = z.object({
  name: z.string().trim().min(2).max(160),
  category: z.enum(['Hospital', 'Clinic', 'Doctor', 'Pharmacy']),
  address: z.string().trim().min(3).max(300), city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80),
  postal_code: z.string().trim().max(12).nullish(), phone: z.string().trim().max(30).nullish(),
  services: list.default([]), specialties: list.default([]), languages: list.default(['English']),
  hours: z.string().trim().max(200).default('Hours not provided'),
  open24h: z.boolean().default(false), emergency: z.boolean().default(false),
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
}).strict();
// Publication/verification are intentionally NOT writable here: they only change through dedicated workflow endpoints.
export const ProviderPatch = ProviderInput.partial();
