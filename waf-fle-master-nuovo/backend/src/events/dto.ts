import { z } from 'zod';

export const EventQuerySchema = z.object({
  sourceIp: z.string().ip().optional(),
  ruleId: z.string().optional(),
  uriContains: z.string().optional(),
  method: z.string().optional(),
  action: z.string().optional(), // blocked / allowed
  fromTs: z.string().datetime().optional(), // ISO timestamp
  toTs: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1), // numero pagina
  limit: z.coerce.number().min(1).max(500).default(100)
});

export type EventQuery = z.infer<typeof EventQuerySchema>;
