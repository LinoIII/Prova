import { ZodSchema } from 'zod';
import { FastifyRequest } from 'fastify';

export function validateBody<T>(req: FastifyRequest, schema: ZodSchema<T>): T {
  const res = schema.safeParse(req.body);
  if (!res.success) {
    throw { statusCode: 400, message: 'Invalid body', issues: res.error.issues };
  }
  return res.data;
}
