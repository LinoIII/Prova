import { FastifyReply, FastifyRequest } from 'fastify';

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  try {
    const decoded = await req.jwtVerify<{ role?: string }>();
    if (decoded.role !== 'ADMIN') {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}
